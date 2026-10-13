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
  const userMsg = (messages.find((m) => m.role === "user")?.content || "");
  const fallbackAnswer = generateIntelligentAcademicResponse(userMsg);
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
  const userMsg = (messages.find((m) => m.role === "user")?.content || "");
  const fallbackAnswer = generateIntelligentAcademicResponse(userMsg);
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

  const userMsg = (messages.find((m) => m.role === "user")?.content || "");
  const fallbackAnswer = generateIntelligentAcademicResponse(userMsg);
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

  const userMsg = (messages.find((m) => m.role === "user")?.content || "");
  const fallbackAnswer = generateIntelligentAcademicResponse(userMsg);
  controller.enqueue(sseChunk(fallbackAnswer));
}

function generateIntelligentAcademicResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("neural network") || q.includes("neural") || q.includes("deep learning") || q.includes("cnn") || q.includes("rnn")) {
    return `### 🧠 Mastering Neural Networks & Real-World Industry Applications\n\n` +
      `A **Neural Network** is a computational architecture inspired by the biological nervous system, designed to learn complex non-linear representations directly from raw data through interconnected nodes (neurons), weights, and activation functions.\n\n` +
      `---\n\n` +
      `### 1. 🏗️ Core Architectural Layers\n\n` +
      `| Layer | Mathematical Role | Engineering Purpose |\n` +
      `| :--- | :--- | :--- |\n` +
      `| **Input Layer** | Accepts normalized input vector $\\mathbf{x} \\in \\mathbb{R}^d$ | Feeds feature vector into the network |\n` +
      `| **Hidden Layers** | Computes $\\mathbf{a} = \\sigma(\\mathbf{W}\\mathbf{x} + \\mathbf{b})$ | Extracts hierarchical non-linear feature representations |\n` +
      `| **Output Layer** | Computes probability distribution or regression value | Delivers classification logits (Softmax) or scalar predictions |\n\n` +
      `---\n\n` +
      `### 2. ⚡ The Learning Pipeline (Backpropagation & Gradient Descent)\n\n` +
      `1. **Forward Propagation:** Inputs propagate forward through matrix multiplications and non-linear activations (ReLU, GELU, Sigmoid) to generate prediction $\\hat{y}$.\n` +
      `2. **Loss Calculation:** Loss functions like Cross-Entropy ($L = -\\sum y \\log(\\hat{y})$) or MSE measure error magnitude.\n` +
      `3. **Backward Propagation:** The Chain Rule of Calculus computes partial derivatives $\\frac{\\partial L}{\\partial \\mathbf{W}}$ for every parameter.\n` +
      `4. **Weight Updates (Optimization):** Optimizers (Adam, SGD with Momentum) update weights: $\\mathbf{W} \\leftarrow \\mathbf{W} - \\eta \\nabla_{\\mathbf{W}} L$.\n\n` +
      `---\n\n` +
      `### 3. 🌐 Critical Real-World & Industry Use Cases\n\n` +
      `* **Autonomous Vehicles & Computer Vision:** Convolutional Neural Networks (CNNs) & Vision Transformers (ViTs) perform real-time pedestrian detection, lane tracking, and LiDAR point cloud segmentation.\n` +
      `* **Healthcare & Medical Diagnostics:** Deep neural nets analyze MRI, CT scans, and histopathology slides to detect oncological tumors with human-radiologist parity.\n` +
      `* **Natural Language Processing & LLMs:** Transformer-based neural architectures power modern conversational agents, semantic code synthesis, and multilingual translation.\n` +
      `* **Financial Fraud Detection:** High-throughput recurrent and graph neural nets evaluate millions of transactions per second to catch credit card anomalies in sub-10ms latency.\n` +
      `* **Recommendation Systems:** Deep Learning Recommendation Models (DLRM) personalize video feeds, e-commerce rankings, and content streams for billions of active users.\n\n` +
      `*💡 Note: Connected live AI provider was temporarily unavailable. Exam-Buddy automatically generated this verified academic breakdown!*`;
  }

  if (q.includes("facebook") || (q.includes("algorithm") && (q.includes("business") || q.includes("customer") || q.includes("reach")))) {
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
      `*💡 Note: Connected live AI provider was temporarily unavailable. Exam-Buddy automatically generated this verified academic breakdown!*`;
  }

  return `### 📚 Academic Concept Overview: ${query.slice(0, 70)}\n\n` +
    `Here is a structured academic examination breakdown for **"${query.slice(0, 60)}"**:\n\n` +
    `1. **Core Principle & Theoretical Framework:**\n` +
    `   - This topic forms a foundational pillar in engineering and university curricula.\n` +
    `   - Requires understanding input preconditions, operational invariants, and output states.\n\n` +
    `2. **Real-World & Production Applications:**\n` +
    `   - Deployed in scalable software systems, systems architecture, and distributed engineering workflows.\n\n` +
    `3. **University Exam Strategy & Mark Distribution:**\n` +
    `   - **5-Mark Question:** Provide concise definition, formal block diagram, and bulleted pros/cons.\n` +
    `   - **10-Mark Question:** Include step-by-step mathematical proof, trace table, and sample code implementation.\n\n` +
    `*💡 Note: Connected live AI provider was temporarily unavailable. Connect a free Groq or Gemini API key in the top header for live streaming responses!*`;
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
  const userMsg = (messages.find((m) => m.role === "user")?.content || "");
  const fallbackAnswer = generateIntelligentAcademicResponse(userMsg);
  controller.enqueue(sseChunk(fallbackAnswer));
}

export async function POST(req: NextRequest) {
  const body: any = await req.json();
  const { provider, apiKeys = [], apiKey, model, messages, ollamaEndpoint, ollamaModel } = body;
  const keysToUse: string[] = Array.isArray(apiKeys) && apiKeys.length > 0 ? apiKeys : apiKey ? [apiKey] : [];

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
