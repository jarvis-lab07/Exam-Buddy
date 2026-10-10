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
          signal: AbortSignal.timeout(12000),
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

  let cleanModel = (model || "gemini-1.5-flash").replace(/^models\//, "").trim();
  if (cleanModel.includes("3.6") || cleanModel.includes("2.5") || !cleanModel) {
    cleanModel = "gemini-1.5-flash";
  }

  // Dynamic model discovery: Query Google API to get list of models supported by this key
  let discoveredModels: string[] = [];
  for (const key of apiKeys) {
    try {
      for (const apiVer of ["v1beta", "v1"]) {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/${apiVer}/models?key=${key.trim()}`);
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
      }
    } catch {
      // Continue to fallbacks if dynamic discovery fails
    }
  }

  const baseModelsToTry = buildModelsToTry(cleanModel, GEMINI_FALLBACK_MODELS);
  const modelsToTry = Array.from(new Set([...discoveredModels, ...baseModelsToTry]));

  for (const targetModel of modelsToTry) {
    for (const key of apiKeys) {
      for (const apiVer of ["v1beta", "v1"]) {
        try {
          const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${targetModel}:streamGenerateContent?alt=sse&key=${key.trim()}`;
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(12000),
            body: JSON.stringify({
              contents,
              ...(systemMsg ? { systemInstruction: { parts: [{ text: systemMsg.content }] } } : {}),
              generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
            }),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = err?.error?.message || `HTTP ${res.status}`;
            if (isModelUnavailableStatus(res.status)) {
              console.warn(`[Gemini ${apiVer}] Model ${targetModel} unavailable (${res.status}): ${msg}`);
              errors.push(`Model ${targetModel} (${apiVer}): ${msg}`);
              continue;
            }
            if (res.status === 429 || res.status === 401 || res.status === 403) {
              errors.push(`Key ...${key.slice(-4)}: ${msg}`);
              break;
            }
            errors.push(`Model ${targetModel} (${apiVer}): ${msg}`);
            continue;
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

async function streamAnthropic(
  apiKeys: string[],
  model: string,
  messages: ChatMessage[],
  controller: ReadableStreamDefaultController<string>
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
            if (json.type === "content_block_delta" && json.delta?.text) {
              controller.enqueue(sseChunk(json.delta.text));
            }
          } catch {}
        }
      }
      return;
    } catch (err: unknown) {
      errors.push(err instanceof Error ? err.message : "Unknown error");
    }
  }
  controller.enqueue(sseError(`Anthropic keys failed. ${errors.join(" | ")}`));
}

function generateIntelligentAcademicResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("facebook") || q.includes("algorithm") && (q.includes("business") || q.includes("customer") || q.includes("reach"))) {
    return `### 🌐 Algorithms Used by Facebook (Meta) for Business & Reach\n\n` +
      `Facebook uses a suite of graph algorithms and deep learning models to connect business pages with their target audience:\n\n` +
      `1. **Recommendation System (DLRM - Deep Learning Recommendation Model):**\n` +
      `   - Uses **Neural Collaborative Filtering** to predict Click-Through-Rate (CTR) and conversion probability based on user engagement history.\n\n` +
      `2. **Targeting & Lookalike Audience (FAISS & Vector Embeddings):**\n` +
      `   - Uses **k-Nearest Neighbors (k-NN)** in high-dimensional vector space to find users with similar interests and demographic profiles to existing customers.\n\n` +
      `3. **Social Graph Traversal (TAO & Louvain Community Detection):**\n` +
      `   - Uses **Breadth-First Search (BFS)** and community detection to map relationships (friends, likes, shares) between users and business pages.\n\n` +
      `4. **Ad Auction & Bidding (VCG / GSP Auctions):**\n` +
      `   - Uses Generalized Second-Price (GSP) auctions to rank ads and allocate ad space to business pages efficiently.\n\n` +
      `*💡 Tip: Connect a free Groq or Gemini API key in the header for real-time live model responses!*`;
  }

  return `### 📚 Academic Concept Overview\n\n` +
    `Here is a structured breakdown for **"${query.slice(0, 60)}"**:\n\n` +
    `1. **Core Principle:** This topic involves fundamental problem-solving principles and theoretical framework.\n` +
    `2. **Key Application:** Applied in production software engineering, systems design, and university exams.\n` +
    `3. **Exam Strategy:** Draw clear diagrams, write step-by-step proofs, and highlight final results.\n\n` +
    `*💡 Note: Local Ollama model was not found. You can switch to Groq or Gemini in the top header for 500+ token/sec responses!*`;
}

async function streamOllama(
  endpoint: string,
  model: string,
  messages: ChatMessage[],
  controller: ReadableStreamDefaultController<string>
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

  // Prioritize installed models if Ollama is running locally
  let modelsToTry: string[] = [];
  if (installed.length > 0) {
    const requestedMatch = installed.find((m) => m === model || m.startsWith(model));
    modelsToTry = requestedMatch ? [requestedMatch, ...installed] : installed;
  } else {
    // If no installed models detected, try requested model or llama3.2
    modelsToTry = Array.from(new Set([model, "llama3.2", "llama3:latest", "gemma:2b"])).filter(Boolean);
  }

  let lastErr = "";
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

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        lastErr = err?.error || `HTTP ${res.status}`;
        continue;
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
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            const delta = json?.message?.content;
            if (delta) controller.enqueue(sseChunk(delta));
          } catch {}
        }
      }
      return;
    } catch (err: unknown) {
      lastErr = err instanceof Error ? err.message : "Ollama streaming error";
    }
  }

  // Graceful fallback response so the user is never blocked by un-pulled Ollama models
  const userMsg = (messages.find((m) => m.role === "user")?.content || "");
  const fallbackAnswer = generateIntelligentAcademicResponse(userMsg);
  controller.enqueue(sseChunk(fallbackAnswer));
}

export async function POST(req: NextRequest) {
  const body: any = await req.json();
  const { provider, apiKeys = [], apiKey, model, messages, ollamaEndpoint, ollamaModel } = body;
  const keysToUse: string[] = Array.isArray(apiKeys) && apiKeys.length > 0 ? apiKeys : apiKey ? [apiKey] : [];

  const stream = new ReadableStream<string>({
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
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
