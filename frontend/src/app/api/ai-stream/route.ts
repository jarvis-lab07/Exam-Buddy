import { NextRequest } from "next/server";
import {
  GEMINI_FALLBACK_MODELS,
  GROQ_FALLBACK_MODELS,
  OLLAMA_FALLBACK_MODELS,
  OPENAI_FALLBACK_MODELS,
  buildModelsToTry,
  isModelUnavailableStatus,
} from "@/lib/ai-model-fallbacks";

export const runtime = "edge";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface RequestBody {
  provider: "gemini" | "groq" | "openai" | "ollama";
  apiKeys: string[];
  model: string;
  messages: ChatMessage[];
  ollamaEndpoint?: string;
  ollamaModel?: string;
}

function sseChunk(text: string) {
  return `data: ${JSON.stringify({ delta: text })}\n\n`;
}

function sseDone() {
  return `data: [DONE]\n\n`;
}

function sseError(msg: string) {
  return `data: ${JSON.stringify({ error: msg })}\n\n`;
}

async function streamGroq(
  apiKeys: string[],
  model: string,
  messages: ChatMessage[],
  controller: ReadableStreamDefaultController<string>
) {
  const errors: string[] = [];
  const modelsToTry = buildModelsToTry(model, GROQ_FALLBACK_MODELS);

  for (const targetModel of modelsToTry) {
    for (const key of apiKeys) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key.trim()}`,
          },
          body: JSON.stringify({ model: targetModel, messages, temperature: 0.3, max_tokens: 2048, stream: true }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const msg = err?.error?.message || `HTTP ${res.status}`;
          if (isModelUnavailableStatus(res.status)) {
            console.warn(`[Groq] Model ${targetModel} unavailable (${res.status}): ${msg}`);
            errors.push(`Model ${targetModel}: ${msg}`);
            break;
          }
          if (res.status === 429 || res.status === 401 || res.status === 403) {
            errors.push(`Key ...${key.slice(-4)}: ${msg}`);
            continue;
          }
          errors.push(`Model ${targetModel}: ${msg}`);
          break;
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.replace(/^data:\s*/, "");
            if (!trimmed || trimmed === "[DONE]") continue;
            try {
              const json = JSON.parse(trimmed);
              const delta = json?.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(sseChunk(delta));
            } catch {}
          }
        }
        return;
      } catch (err: unknown) {
        errors.push(err instanceof Error ? err.message : "Unknown error");
      }
    }
  }
  controller.enqueue(sseError(`All Groq keys/models failed. ${errors.join(" | ")}`));
}

async function streamGemini(
  apiKeys: string[],
  model: string,
  messages: ChatMessage[],
  controller: ReadableStreamDefaultController<string>
) {
  const errors: string[] = [];
  const systemMsg = messages.find((m) => m.role === "system");
  const chatMsgs = messages.filter((m) => m.role !== "system");
  const contents = chatMsgs.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  let cleanModel = (model || "gemini-2.5-flash").replace(/^models\//, "").trim();
  if (cleanModel.includes("3.6") || cleanModel === "gemini-2.5-flash" || cleanModel === "gemini-1.5-flash") {
    cleanModel = "gemini-2.5-flash";
  }

  const modelsToTry = buildModelsToTry(cleanModel, GEMINI_FALLBACK_MODELS);

  for (const targetModel of modelsToTry) {
    for (const key of apiKeys) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:streamGenerateContent?alt=sse&key=${key.trim()}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            ...(systemMsg ? { systemInstruction: { parts: [{ text: systemMsg.content }] } } : {}),
            generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const msg = err?.error?.message || `HTTP ${res.status}`;
          if (isModelUnavailableStatus(res.status)) {
            console.warn(`[Gemini] Model ${targetModel} unavailable (${res.status}): ${msg}`);
            errors.push(`Model ${targetModel}: ${msg}`);
            break;
          }
          if (res.status === 429 || res.status === 401 || res.status === 403) {
            errors.push(`Key ...${key.slice(-4)}: ${msg}`);
            continue;
          }
          errors.push(`Model ${targetModel}: ${msg}`);
          break;
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.replace(/^data:\s*/, "");
            if (!trimmed) continue;
            try {
              const json = JSON.parse(trimmed);
              const delta = json?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (delta) controller.enqueue(sseChunk(delta));
            } catch {}
          }
        }
        return;
      } catch (err: unknown) {
        errors.push(err instanceof Error ? err.message : "Unknown error");
      }
    }
  }
  controller.enqueue(sseError(`All Gemini keys/models failed. ${errors.join(" | ")}`));
}

async function streamOpenAI(
  apiKeys: string[],
  model: string,
  messages: ChatMessage[],
  controller: ReadableStreamDefaultController<string>
) {
  const errors: string[] = [];
  const modelsToTry = buildModelsToTry(model || "gpt-4o-mini", OPENAI_FALLBACK_MODELS);

  for (const targetModel of modelsToTry) {
    for (const key of apiKeys) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key.trim()}`,
          },
          body: JSON.stringify({
            model: targetModel,
            messages,
            temperature: 0.3,
            max_tokens: 2048,
            stream: true,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const msg = err?.error?.message || `HTTP ${res.status}`;
          if (isModelUnavailableStatus(res.status)) {
            console.warn(`[OpenAI] Model ${targetModel} unavailable (${res.status}): ${msg}`);
            errors.push(`Model ${targetModel}: ${msg}`);
            break;
          }
          if (res.status === 429 || res.status === 401 || res.status === 403) {
            errors.push(`Key ...${key.slice(-4)}: ${msg}`);
            continue;
          }
          errors.push(`Model ${targetModel}: ${msg}`);
          break;
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.replace(/^data:\s*/, "");
            if (!trimmed || trimmed === "[DONE]") continue;
            try {
              const json = JSON.parse(trimmed);
              const delta = json?.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(sseChunk(delta));
            } catch {}
          }
        }
        return;
      } catch (err: unknown) {
        errors.push(err instanceof Error ? err.message : "Unknown error");
      }
    }
  }
  controller.enqueue(sseError(`All OpenAI keys/models failed. ${errors.join(" | ")}`));
}

export async function POST(req: NextRequest) {
  const body: RequestBody = await req.json();
  const { provider, apiKeys = [], model, messages, ollamaEndpoint, ollamaModel } = body;

  const stream = new ReadableStream<string>({
    async start(controller) {
      try {
        if (provider === "groq") {
          await streamGroq(apiKeys, model, messages, controller);
        } else if (provider === "gemini") {
          await streamGemini(apiKeys, model, messages, controller);
        } else if (provider === "openai") {
          await streamOpenAI(apiKeys, model, messages, controller);
        } else if (provider === "ollama") {
          const endpoint = ollamaEndpoint || "http://localhost:11434";
          const requestedModel = ollamaModel || "llama3:latest";
          const origin = req.nextUrl.origin;

          let installed: string[] = [];
          try {
            const tagsRes = await fetch(`${origin}/api/ollama`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "tags", endpoint }),
            });
            const tagsData = await tagsRes.json();
            if (tagsData.success && Array.isArray(tagsData.models)) {
              installed = tagsData.models.map((m: { name: string }) => m.name).filter(Boolean);
            }
          } catch (err: unknown) {
            console.warn("[Ollama] Could not list installed tags:", err);
          }

          const preferred = buildModelsToTry(requestedModel, OLLAMA_FALLBACK_MODELS);
          const modelsToTry = Array.from(new Set([...preferred, ...installed]));
          let success = false;
          let lastErr = "";

          for (const targetModel of modelsToTry) {
            try {
              const res = await fetch(`${origin}/api/ollama`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "chat", endpoint, model: targetModel, messages }),
              });
              const data = await res.json();
              if (data.success && data.content) {
                controller.enqueue(sseChunk(data.content));
                success = true;
                break;
              }
              lastErr = data.error || `Model ${targetModel} not available`;
              if (isModelUnavailableStatus(res.status)) {
                console.warn(`[Ollama] Model ${targetModel} unavailable (${res.status}): ${lastErr}`);
              }
            } catch (err: unknown) {
              lastErr = err instanceof Error ? err.message : "Ollama connection error";
              console.warn(`[Ollama] Model ${targetModel} failed:`, lastErr);
            }
          }

          if (!success) {
            controller.enqueue(sseError(lastErr || "Ollama failed to generate response. Ensure `ollama serve` is running."));
          }
        } else {
          controller.enqueue(sseError("Unknown provider"));
        }
      } catch (err: unknown) {
        controller.enqueue(sseError(err instanceof Error ? err.message : "Stream error"));
      } finally {
        controller.enqueue(sseDone());
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
