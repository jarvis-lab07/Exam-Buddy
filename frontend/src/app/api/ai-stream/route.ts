import { NextRequest } from "next/server";
import {
  GEMINI_FALLBACK_MODELS,
  GROQ_FALLBACK_MODELS,
  OLLAMA_FALLBACK_MODELS,
  OPENAI_FALLBACK_MODELS,
  buildModelsToTry,
  isModelUnavailableStatus,
} from "@/lib/ai-model-fallbacks";
import { generateUniversalAcademicResponse } from "@/lib/universal-academic-engine";

export const runtime = "edge";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function getLatestUserMessage(messages: ChatMessage[]): string {
  return [...messages].reverse().find((m) => m.role === "user")?.content || "";
}

interface RequestBody {
  provider: "gemini" | "groq" | "openai" | "ollama" | "anthropic";
  apiKeys: string[];
  model: string;
  messages: ChatMessage[];
  ollamaEndpoint?: string;
  ollamaModel?: string;
}

const encoder = new TextEncoder();

function sseChunk(text: string): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify({ delta: text })}\n\n`);
}

function sseDone(): Uint8Array {
  return encoder.encode(`data: [DONE]\n\n`);
}

function sseError(msg: string): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`);
}

const GEMINI_SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
];

async function streamGroq(
  apiKeys: string[],
  model: string,
  messages: ChatMessage[],
  controller: ReadableStreamDefaultController<Uint8Array>
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
          signal: AbortSignal.timeout(12000),
          body: JSON.stringify({ model: targetModel, messages, temperature: 0.3, max_tokens: 2048, stream: true }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const msg = err?.error?.message || `HTTP ${res.status}`;
          if (isModelUnavailableStatus(res.status, msg)) {
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
        let deltasEnqueued = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.replace(/^data:\s*/, "").trim();
            if (!trimmed || trimmed === "[DONE]") continue;
            try {
              const json = JSON.parse(trimmed);
              const delta = json?.choices?.[0]?.delta?.content;
              if (delta) {
                controller.enqueue(sseChunk(delta));
                deltasEnqueued++;
              }
            } catch {}
          }
        }

        if (deltasEnqueued > 0) return;
      } catch (err: unknown) {
        errors.push(err instanceof Error ? err.message : "Unknown error");
      }
    }
  }

  // Graceful fallback response if all Groq attempts fail
  const userMsg = getLatestUserMessage(messages);
  const fallbackAnswer = generateUniversalAcademicResponse(userMsg);
  controller.enqueue(sseChunk(fallbackAnswer));
}

async function streamGemini(
  apiKeys: string[],
  model: string,
  messages: ChatMessage[],
  controller: ReadableStreamDefaultController<Uint8Array>
) {
  const errors: string[] = [];
  const systemMsg = messages.find((m) => m.role === "system");
  const chatMsgs = messages.filter((m) => m.role !== "system");
  const contents = chatMsgs.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  // Clean model name - support gemini-1.5-flash, gemini-2.0-flash, gemini-2.5-flash, etc.
  let cleanModel = (model || "gemini-1.5-flash").replace(/^models\//, "").trim();
  if (!cleanModel || cleanModel.includes("3.6")) {
    cleanModel = "gemini-1.5-flash";
  }

  // Dynamic model discovery for keys (optional fast probe)
  let discoveredModels: string[] = [];
  for (const key of apiKeys) {
    try {
      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key.trim()}`,
        { signal: AbortSignal.timeout(3000) }
      );
      if (listRes.ok) {
        const listData = await listRes.json();
        const valid = (listData.models || [])
          .filter((m: any) =>
            (m.supportedGenerationMethods || []).some((method: string) =>
              method.includes("generateContent") || method.includes("streamGenerateContent")
            )
          )
          .map((m: any) => m.name.replace(/^models\//, ""));
        if (valid.length > 0) {
          discoveredModels.push(...valid);
          break;
        }
      }
    } catch {}
  }

  // Crucial: Put cleanModel first so user's selected model takes priority!
  const baseModelsToTry = buildModelsToTry(cleanModel, GEMINI_FALLBACK_MODELS);
  const modelsToTry = Array.from(new Set([cleanModel, ...discoveredModels, ...baseModelsToTry]));

  for (const targetModel of modelsToTry) {
    for (const key of apiKeys) {
      for (const apiVer of ["v1beta", "v1"]) {
        try {
          const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${targetModel}:streamGenerateContent?alt=sse&key=${key.trim()}`;

          // Format contents according to API version:
          // v1beta supports systemInstruction; v1 requires system instructions prepended to contents.
          const isV1 = apiVer === "v1";
          const requestContents = isV1 && systemMsg
            ? [
                { role: "user", parts: [{ text: `[System Instructions]: ${systemMsg.content}` }] },
                { role: "model", parts: [{ text: "Understood. I will strictly follow the academic guidelines." }] },
                ...contents,
              ]
            : contents;

          const requestBody: any = {
            contents: requestContents,
            safetySettings: GEMINI_SAFETY_SETTINGS,
            generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
          };

          if (!isV1 && systemMsg) {
            requestBody.systemInstruction = { parts: [{ text: systemMsg.content }] };
          }

          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(12000),
            body: JSON.stringify(requestBody),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = err?.error?.message || `HTTP ${res.status}`;
            if (isModelUnavailableStatus(res.status, msg)) {
              console.warn(`[Gemini ${apiVer}] Model ${targetModel} unavailable (${res.status}): ${msg}`);
              errors.push(`Model ${targetModel} (${apiVer}): ${msg}`);
              continue;
            }
            if (res.status === 429 || res.status === 401 || res.status === 403 || msg.includes("API key")) {
              errors.push(`Key ...${key.slice(-4)}: ${msg}`);
              break;
            }
            errors.push(`Model ${targetModel} (${apiVer}): ${msg}`);
            continue;
          }

          const reader = res.body!.getReader();
          const decoder = new TextDecoder();
          let buf = "";
          let deltasEnqueued = 0;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            const lines = buf.split("\n");
            buf = lines.pop() || "";
            for (const line of lines) {
              const trimmed = line.replace(/^data:\s*/, "").trim();
              if (!trimmed || trimmed === "[DONE]") continue;
              try {
                const json = JSON.parse(trimmed);
                const parts = json?.candidates?.[0]?.content?.parts;
                if (Array.isArray(parts)) {
                  for (const part of parts) {
                    if (part?.text) {
                      controller.enqueue(sseChunk(part.text));
                      deltasEnqueued++;
                    }
                  }
                }
              } catch {}
            }
          }

          // Flush any final line in the buffer
          if (buf.trim()) {
            const trimmed = buf.replace(/^data:\s*/, "").trim();
            if (trimmed && trimmed !== "[DONE]") {
              try {
                const json = JSON.parse(trimmed);
                const parts = json?.candidates?.[0]?.content?.parts;
                if (Array.isArray(parts)) {
                  for (const part of parts) {
                    if (part?.text) {
                      controller.enqueue(sseChunk(part.text));
                      deltasEnqueued++;
                    }
                  }
                }
              } catch {}
            }
          }

          // If stream yielded output, success!
          if (deltasEnqueued > 0) {
            return;
          }

          // Defensive fallback: If stream returned 200 OK but produced 0 text tokens
          // (documented Gemini empty candidate bug / silent STOP anomaly), call non-streaming generateContent!
          console.warn(`[Gemini] Stream returned 0 deltas for ${targetModel} (${apiVer}). Falling back to non-streaming generateContent.`);
          const directUrl = `https://generativelanguage.googleapis.com/${apiVer}/models/${targetModel}:generateContent?key=${key.trim()}`;
          const directRes = await fetch(directUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(10000),
            body: JSON.stringify(requestBody),
          });

          if (directRes.ok) {
            const directData = await directRes.json();
            const parts = directData?.candidates?.[0]?.content?.parts;
            const fullText = Array.isArray(parts)
              ? parts.map((p: any) => p?.text || "").join("")
              : "";
            if (fullText) {
              controller.enqueue(sseChunk(fullText));
              return;
            }
          }
        } catch (err: unknown) {
          errors.push(err instanceof Error ? err.message : "Unknown error");
        }
      }
    }
  }

  // Graceful fallback response so the student is never blocked with an empty response
  const userMsg = getLatestUserMessage(messages);
  const fallbackAnswer = generateUniversalAcademicResponse(userMsg);
  controller.enqueue(sseChunk(fallbackAnswer));
}

async function streamOpenAI(
  apiKeys: string[],
  model: string,
  messages: ChatMessage[],
  controller: ReadableStreamDefaultController<Uint8Array>
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
          signal: AbortSignal.timeout(12000),
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
          if (isModelUnavailableStatus(res.status, msg)) {
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
        let deltasEnqueued = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.replace(/^data:\s*/, "").trim();
            if (!trimmed || trimmed === "[DONE]") continue;
            try {
              const json = JSON.parse(trimmed);
              const delta = json?.choices?.[0]?.delta?.content;
              if (delta) {
                controller.enqueue(sseChunk(delta));
                deltasEnqueued++;
              }
            } catch {}
          }
        }

        if (deltasEnqueued > 0) return;
      } catch (err: unknown) {
        errors.push(err instanceof Error ? err.message : "Unknown error");
      }
    }
  }

  const userMsg = getLatestUserMessage(messages);
  const fallbackAnswer = generateUniversalAcademicResponse(userMsg);
  controller.enqueue(sseChunk(fallbackAnswer));
}

async function streamAnthropic(
  apiKeys: string[],
  model: string,
  messages: ChatMessage[],
  controller: ReadableStreamDefaultController<Uint8Array>
) {
  const errors: string[] = [];
  const systemMsg = messages.find((m) => m.role === "system");
  const chatMsgs = messages.filter((m) => m.role !== "system");
  const targetModel = model.includes("claude") ? model : "claude-3-5-sonnet-20241022";

  for (const key of apiKeys) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key.trim(),
          "anthropic-version": "2023-06-01",
        },
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({
          model: targetModel,
          max_tokens: 2048,
          messages: chatMsgs.map((m) => ({ role: m.role, content: m.content })),
          ...(systemMsg ? { system: systemMsg.content } : {}),
          stream: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.error?.message || `HTTP ${res.status}`;
        errors.push(`Anthropic: ${msg}`);
        continue;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let deltasEnqueued = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          const trimmed = line.replace(/^data:\s*/, "").trim();
          if (!trimmed) continue;
          try {
            const json = JSON.parse(trimmed);
            if (json.type === "content_block_delta" && json.delta?.text) {
              controller.enqueue(sseChunk(json.delta.text));
              deltasEnqueued++;
            }
          } catch {}
        }
      }

      if (deltasEnqueued > 0) return;
    } catch (err: unknown) {
      errors.push(err instanceof Error ? err.message : "Unknown error");
    }
  }

  const userMsg = getLatestUserMessage(messages);
  const fallbackAnswer = generateUniversalAcademicResponse(userMsg);
  controller.enqueue(sseChunk(fallbackAnswer));
}

function generateIntelligentAcademicResponse(query: string): string {
  return generateUniversalAcademicResponse(query);
}

async function streamOllama(
  endpoint: string,
  model: string,
  messages: ChatMessage[],
  controller: ReadableStreamDefaultController<Uint8Array>
) {
  const cleanEndpoint = (endpoint || "http://localhost:11434").replace(/\/+$/, "");
  let installed: string[] = [];
  try {
    const tagsRes = await fetch(`${cleanEndpoint}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    if (tagsRes.ok) {
      const data = await tagsRes.json();
      installed = (data.models || []).map((m: { name: string }) => m.name).filter(Boolean);
    }
  } catch {}

  let modelsToTry: string[] = [];
  if (installed.length > 0) {
    const requestedMatch = installed.find((m) => m === model || m.startsWith(model));
    modelsToTry = requestedMatch ? [requestedMatch, ...installed] : installed;
  } else {
    modelsToTry = Array.from(new Set([model, "llama3.2", "llama3:latest", "gemma:2b"])).filter(Boolean);
  }

  for (const targetModel of modelsToTry) {
    try {
      const res = await fetch(`${cleanEndpoint}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({
          model: targetModel,
          messages,
          stream: true,
          options: {
            temperature: 0.3,
            num_predict: 1024,
          },
        }),
      });

      if (!res.ok) continue;

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let deltasEnqueued = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            const delta = json?.message?.content;
            if (delta) {
              controller.enqueue(sseChunk(delta));
              deltasEnqueued++;
            }
          } catch {}
        }
      }

      if (deltasEnqueued > 0) return;
    } catch {}
  }

  // Graceful fallback response so the user is never blocked by un-pulled Ollama models
  const userMsg = getLatestUserMessage(messages);
  const fallbackAnswer = generateUniversalAcademicResponse(userMsg);
  controller.enqueue(sseChunk(fallbackAnswer));
}

export async function POST(req: NextRequest) {
  const body: any = await req.json();
  const { provider, apiKeys = [], apiKey, model, messages, ollamaEndpoint, ollamaModel } = body;
  const keysToUse: string[] = Array.isArray(apiKeys) && apiKeys.length > 0 ? [...apiKeys] : apiKey ? [apiKey] : [];

  // Auto-inject server environment keys if client has not configured any keys
  if (keysToUse.length === 0) {
    if (provider === "gemini") {
      const serverKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (serverKey) keysToUse.push(serverKey.trim());
    } else if (provider === "groq") {
      const serverKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
      if (serverKey) keysToUse.push(serverKey.trim());
    } else if (provider === "openai") {
      const serverKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      if (serverKey) keysToUse.push(serverKey.trim());
    }
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (provider === "groq") {
          await streamGroq(keysToUse, model, messages, controller);
        } else if (provider === "gemini") {
          await streamGemini(keysToUse, model, messages, controller);
        } else if (provider === "openai") {
          await streamOpenAI(keysToUse, model, messages, controller);
        } else if (provider === "anthropic") {
          await streamAnthropic(keysToUse, model, messages, controller);
        } else if (provider === "ollama") {
          await streamOllama(ollamaEndpoint || "http://localhost:11434", ollamaModel || model, messages, controller);
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
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
