// Client-side BYOK (Bring Your Own Key) & Local Ollama AI Service for Exam-Buddy

import {
  GEMINI_FALLBACK_MODELS,
  GROQ_FALLBACK_MODELS,
  OLLAMA_FALLBACK_MODELS,
  OPENAI_FALLBACK_MODELS,
  buildModelsToTry,
  isModelUnavailableStatus,
} from "@/lib/ai-model-fallbacks";

export type AIProvider = "gemini" | "groq" | "openai" | "ollama" | "anthropic";

export interface ProviderMeta {
  id: AIProvider;
  name: string;
  defaultModel: string;
  popularModels: string[];
  tagline: string;
  isFreeTier: boolean;
  isLocal?: boolean;
  getApiKeyUrl: string;
  placeholder: string;
}

export const AI_PROVIDERS: Record<AIProvider, ProviderMeta> = {
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    defaultModel: "gemini-1.5-flash",
    popularModels: [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-2.0-flash-exp",
    ],
    tagline: "Free tier with 15 RPM • Fast & accurate",
    isFreeTier: true,
    getApiKeyUrl: "https://aistudio.google.com/app/apikey",
    placeholder: "AIzaSy...",
  },
  groq: {
    id: "groq",
    name: "Groq",
    defaultModel: "llama-3.1-8b-instant",
    popularModels: [
      "llama-3.1-8b-instant",
      "llama-3.3-70b-versatile",
      "llama-3.2-90b-vision-preview",
      "mixtral-8x7b-32768",
      "gemma2-9b-it",
      "qwen-qwq-32b",
      "deepseek-r1-distill-llama-70b",
    ],
    tagline: "Ultra-fast cloud inference (500+ tokens/sec)",
    isFreeTier: true,
    getApiKeyUrl: "https://console.groq.com/keys",
    placeholder: "gsk_...",
  },
  ollama: {
    id: "ollama",
    name: "Ollama (Local AI)",
    defaultModel: "llama3:latest",
    popularModels: [],
    tagline: "100% offline & private on your local GPU/CPU",
    isFreeTier: true,
    isLocal: true,
    getApiKeyUrl: "https://ollama.com",
    placeholder: "http://localhost:11434",
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    defaultModel: "gpt-4o-mini",
    popularModels: [
      "gpt-4o-mini",
      "gpt-4o",
      "gpt-4-turbo",
      "gpt-3.5-turbo",
      "o1-mini",
      "o1-preview",
    ],
    tagline: "High reasoning standard for university exams",
    isFreeTier: false,
    getApiKeyUrl: "https://platform.openai.com/api-keys",
    placeholder: "sk-proj-...",
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic Claude",
    defaultModel: "claude-3-5-sonnet",
    popularModels: ["claude-3-5-sonnet", "claude-3-haiku"],
    tagline: "Superior technical reasoning & academic writing",
    isFreeTier: false,
    getApiKeyUrl: "https://console.anthropic.com/settings/keys",
    placeholder: "sk-ant-...",
  },
};

const STORAGE_KEYS: Record<AIProvider, string> = {
  gemini: "exambuddy_key_gemini",
  groq: "exambuddy_key_groq",
  openai: "exambuddy_key_openai",
  ollama: "exambuddy_ollama_endpoint",
  anthropic: "exambuddy_key_anthropic",
};

// Multi-key storage (arrays of keys for rotation)
const MULTI_KEY_STORAGE: Record<AIProvider, string> = {
  gemini: "exambuddy_keys_gemini",
  groq: "exambuddy_keys_groq",
  openai: "exambuddy_keys_openai",
  ollama: "exambuddy_keys_ollama",
  anthropic: "exambuddy_keys_anthropic",
};

export function getStoredApiKeys(provider: AIProvider): string[] {
  let keys: string[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(MULTI_KEY_STORAGE[provider]);
      const parsed: string[] = raw ? JSON.parse(raw) : [];
      const legacy = localStorage.getItem(STORAGE_KEYS[provider]);
      if (legacy && !parsed.includes(legacy)) parsed.unshift(legacy);
      keys = parsed.filter(Boolean);
    } catch {
      const legacy = localStorage.getItem(STORAGE_KEYS[provider]);
      if (legacy) keys = [legacy];
    }
  }

  // Fallback to process.env environment variables if available
  if (provider === "gemini") {
    const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (envKey && !keys.includes(envKey)) {
      keys.push(envKey.trim());
    }
  } else if (provider === "openai") {
    const envKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (envKey && !keys.includes(envKey)) {
      keys.push(envKey.trim());
    }
  } else if (provider === "groq") {
    const envKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY;
    if (envKey && !keys.includes(envKey)) {
      keys.push(envKey.trim());
    }
  }

  return keys;
}

export function saveApiKeys(provider: AIProvider, keys: string[]): void {
  if (typeof window === "undefined") return;
  const cleaned = keys.map((k) => k.trim()).filter(Boolean);
  localStorage.setItem(MULTI_KEY_STORAGE[provider], JSON.stringify(cleaned));
  // Keep single-key slot in sync with first key for backwards compat
  if (cleaned[0]) {
    localStorage.setItem(STORAGE_KEYS[provider], cleaned[0]);
  } else {
    localStorage.removeItem(STORAGE_KEYS[provider]);
  }
}

export const OLLAMA_MODEL_KEY = "exambuddy_ollama_model";
const ACTIVE_PROVIDER_KEY = "exambuddy_active_provider";

// Per-provider custom model selection storage
const MODEL_SELECTION_KEY_PREFIX = "exambuddy_model_";

export function getSelectedModel(provider: AIProvider): string {
  if (typeof window === "undefined") return AI_PROVIDERS[provider].defaultModel;
  if (provider === "ollama") return getOllamaModel();
  const stored = localStorage.getItem(`${MODEL_SELECTION_KEY_PREFIX}${provider}`);
  if (stored && provider === "gemini" && (stored.includes("3.6") || stored.includes("2.5") || stored === "gemini-1.5-flash")) {
    const updated = AI_PROVIDERS.gemini.defaultModel;
    saveSelectedModel("gemini", updated);
    return updated;
  }
  return stored || AI_PROVIDERS[provider].defaultModel;
}

export function saveSelectedModel(provider: AIProvider, model: string): void {
  if (typeof window === "undefined") return;
  if (provider === "ollama") {
    saveOllamaModel(model);
    return;
  }
  const trimmed = model.trim();
  if (trimmed) {
    localStorage.setItem(`${MODEL_SELECTION_KEY_PREFIX}${provider}`, trimmed);
  } else {
    localStorage.removeItem(`${MODEL_SELECTION_KEY_PREFIX}${provider}`);
  }
}

export interface StoredKeys {
  gemini?: string;
  groq?: string;
  openai?: string;
  ollama?: string;
}

// ----------------- Storage Helpers -----------------

export function getStoredApiKey(provider: AIProvider): string {
  if (provider === "ollama") {
    if (typeof window === "undefined") return "http://localhost:11434";
    return localStorage.getItem(STORAGE_KEYS.ollama) || "http://localhost:11434";
  }
  let key = "";
  if (typeof window !== "undefined") {
    key = localStorage.getItem(STORAGE_KEYS[provider]) || "";
  }
  if (!key) {
    if (provider === "gemini") {
      key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
    } else if (provider === "openai") {
      key = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "";
    } else if (provider === "groq") {
      key = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY || "";
    }
  }
  return key;
}

export function saveApiKey(provider: AIProvider, key: string): void {
  if (typeof window === "undefined") return;
  const trimmed = key.trim();
  if (trimmed) {
    localStorage.setItem(STORAGE_KEYS[provider], trimmed);
  } else {
    localStorage.removeItem(STORAGE_KEYS[provider]);
  }
}

export function getOllamaEndpoint(): string {
  if (typeof window === "undefined") return "http://localhost:11434";
  return localStorage.getItem(STORAGE_KEYS.ollama) || "http://localhost:11434";
}

export function saveOllamaEndpoint(endpoint: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.ollama, endpoint.trim() || "http://localhost:11434");
}

export function getOllamaModel(): string {
  if (typeof window === "undefined") return "llama3:latest";
  return localStorage.getItem(OLLAMA_MODEL_KEY) || "llama3:latest";
}

export function saveOllamaModel(model: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(OLLAMA_MODEL_KEY, model.trim());
}

export function getAllStoredKeys(): StoredKeys {
  if (typeof window === "undefined") return {};
  return {
    gemini: localStorage.getItem(STORAGE_KEYS.gemini) || undefined,
    groq: localStorage.getItem(STORAGE_KEYS.groq) || undefined,
    openai: localStorage.getItem(STORAGE_KEYS.openai) || undefined,
    ollama: localStorage.getItem(STORAGE_KEYS.ollama) || undefined,
  };
}

export function getActiveProvider(): AIProvider {
  if (typeof window === "undefined") return "gemini";
  const stored = localStorage.getItem(ACTIVE_PROVIDER_KEY) as AIProvider;
  if (stored && AI_PROVIDERS[stored]) {
    return stored;
  }
  const keys = getAllStoredKeys();
  if (keys.gemini || getStoredApiKey("gemini")) return "gemini";
  if (keys.groq) return "groq";
  if (keys.openai) return "openai";
  if (keys.ollama) return "ollama";
  return "gemini";
}

export function setActiveProvider(provider: AIProvider): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_PROVIDER_KEY, provider);
}

// ----------------- Validation & Local Inspection -----------------

export async function fetchOllamaModels(endpoint?: string): Promise<{
  success: boolean;
  models: { name: string; sizeMb?: number }[];
  error?: string;
}> {
  try {
    const cleanEndpoint = (endpoint || getOllamaEndpoint()).trim();
    const res = await fetch("/api/ollama", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "tags",
        endpoint: cleanEndpoint,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, models: [], error: data.error || "Failed to reach Ollama" };
    }
    return { success: true, models: data.models || [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    return { success: false, models: [], error: msg };
  }
}

export async function validateApiKey(
  provider: AIProvider,
  key: string
): Promise<{ valid: boolean; error?: string }> {
  const trimmed = key.trim();

  // Ollama validation
  if (provider === "ollama") {
    try {
      const endpoint = trimmed || getOllamaEndpoint();
      const res = await fetch("/api/ollama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ping", endpoint }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          valid: false,
          error:
            data.error ||
            "Could not reach Ollama at " +
              endpoint +
              ". Run `ollama serve` in your terminal to start it.",
        };
      }
      return { valid: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Connection failed";
      return { valid: false, error: errorMsg };
    }
  }

  if (!trimmed) {
    return { valid: false, error: "API key cannot be empty" };
  }

  try {
    if (provider === "gemini") {
      let lastMessage = "";
      for (const apiVer of ["v1beta", "v1"]) {
        try {
          const listRes = await fetch(`https://generativelanguage.googleapis.com/${apiVer}/models?key=${trimmed}`);
          if (listRes.ok) return { valid: true };
        } catch {}
      }
      const modelsToTry = buildModelsToTry(AI_PROVIDERS.gemini.defaultModel, GEMINI_FALLBACK_MODELS);
      for (const targetModel of modelsToTry) {
        for (const apiVer of ["v1beta", "v1"]) {
          const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${targetModel}:generateContent?key=${trimmed}`;
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: "Hello" }] }],
              generationConfig: { maxOutputTokens: 5 },
            }),
          });
          if (res.ok) return { valid: true };
          const data = await res.json().catch(() => ({}));
          lastMessage = data?.error?.message || `HTTP ${res.status}: Invalid Gemini API Key`;
          if (isModelUnavailableStatus(res.status)) {
            console.warn(`[Gemini ${apiVer}] Model ${targetModel} unavailable (${res.status}): ${lastMessage}`);
            continue;
          }
          return { valid: false, error: lastMessage };
        }
      }
      return { valid: false, error: lastMessage || "All Gemini models failed validation" };
    }

    if (provider === "groq") {
      const modelsToTry = buildModelsToTry(getSelectedModel("groq"), GROQ_FALLBACK_MODELS);
      let lastMessage = "";
      for (const targetModel of modelsToTry) {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${trimmed}`,
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [{ role: "user", content: "hi" }],
            max_tokens: 5,
          }),
        });
        if (res.ok) return { valid: true };
        const data = await res.json().catch(() => ({}));
        lastMessage = data?.error?.message || `HTTP ${res.status}: Invalid Groq API Key`;
        if (isModelUnavailableStatus(res.status)) {
          console.warn(`[Groq] Model ${targetModel} unavailable (${res.status}): ${lastMessage}`);
          continue;
        }
        return { valid: false, error: lastMessage };
      }
      return { valid: false, error: lastMessage || "All Groq models failed validation" };
    }

    if (provider === "openai") {
      const modelsToTry = buildModelsToTry("gpt-4o-mini", OPENAI_FALLBACK_MODELS);
      let lastMessage = "";
      for (const targetModel of modelsToTry) {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${trimmed}`,
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [{ role: "user", content: "hi" }],
            max_tokens: 5,
          }),
        });
        if (res.ok) return { valid: true };
        const data = await res.json().catch(() => ({}));
        lastMessage = data?.error?.message || `HTTP ${res.status}: Invalid OpenAI API Key`;
        if (isModelUnavailableStatus(res.status)) {
          console.warn(`[OpenAI] Model ${targetModel} unavailable (${res.status}): ${lastMessage}`);
          continue;
        }
        return { valid: false, error: lastMessage };
      }
      return { valid: false, error: lastMessage || "All OpenAI models failed validation" };
    }

    return { valid: false, error: "Unknown provider" };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Network error during validation";
    return { valid: false, error: errorMsg };
  }
}

// ----------------- AI Search / Tutor Query -----------------

export interface AISearchResult {
  query: string;
  provider: AIProvider;
  model: string;
  scopeTitle: string;
  markdown: string;
  latencyMs: number;
  isMockDemo: boolean;
}

export interface SearchOptions {
  query: string;
  scopeId?: string;
  scopeTitle?: string;
  syllabusContext?: string;
}

export async function executeAISearch(options: SearchOptions): Promise<AISearchResult> {
  const startTime = Date.now();
  const provider = getActiveProvider();
  const apiKey = getStoredApiKey(provider);
  const scopeTitle = options.scopeTitle || "Entire Semester Syllabus";

  // Build curriculum system prompt
  const systemPrompt = `You are Exam-Buddy AI Tutor, an elite university academic assistant.
Your goal is to answer student queries with precision, high visual structure, and exam-oriented clarity.

ACTIVE SCOPE: "${scopeTitle}"
${options.syllabusContext ? `RELEVANT COURSE TOPICS:\n${options.syllabusContext}` : ""}

FORMAT YOUR RESPONSE IN CLEAN MARKDOWN WITH THESE EXACT SECTIONS:
### 🎯 Executive Summary
(2-3 punchy sentences defining the concept and core mechanism.)

### 📝 Exam-Ready Solution / Breakdown
(Step-by-step explanation, chemical/mathematical equation or architecture diagram if applicable.)

### ⚡ Key Formulas & Complexity
(Essential formulas, laws, or syntax snippets.)

### ⚠️ Common Exam Pitfalls & Examiner Traps
(2-3 common mistakes students make that lose marks.)

### 💡 Likely Exam Questions (PYQ)
(2 likely exam questions on this topic.)`;

  // Concise prompt for local Ollama to ensure 3-5x faster response on CPU/GPU
  const localOllamaPrompt = `You are Exam-Buddy AI Tutor. Provide a direct, exam-oriented explanation for: "${options.query}".
FORMAT IN 4 CONCISE SECTIONS:
### 🎯 Executive Summary
(2-3 clear sentences with definition and function.)

### 📝 Exam-Ready Solution / Breakdown
(Step-by-step explanation, stages, and reactions/working principle.)

### ⚡ Key Formulas & Equations
(Essential equations, chemical reaction formulas, or laws.)

### ⚠️ Common Exam Pitfalls & Mistakes
(Common student misconceptions in university exams.)`;

  // Demo fallback if no key (except for ollama which uses endpoint)
  if (provider !== "ollama" && !apiKey) {
    await new Promise((res) => setTimeout(res, 800));
    const mockContent = generateCurriculumMockResponse(options.query, scopeTitle);
    return {
      query: options.query,
      provider,
      model: `${AI_PROVIDERS[provider].name} (Demo Mode - Add Key)`,
      scopeTitle,
      markdown: mockContent,
      latencyMs: Date.now() - startTime,
      isMockDemo: true,
    };
  }

  try {
    let markdown = "";
    let modelName = getSelectedModel(provider);

    if (provider === "ollama") {
      const endpoint = getOllamaEndpoint();
      const localModel = getOllamaModel();
      let installed: string[] = [];
      const tags = await fetchOllamaModels(endpoint);
      if (tags.success) {
        installed = tags.models.map((m) => m.name).filter(Boolean);
      }
      const modelsToTry = Array.from(
        new Set([...buildModelsToTry(localModel, OLLAMA_FALLBACK_MODELS), ...installed])
      );
      let lastErr = "";

      for (const targetModel of modelsToTry) {
        try {
          const res = await fetch("/api/ollama", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "chat",
              endpoint,
              model: targetModel,
              messages: [
                { role: "system", content: localOllamaPrompt },
                { role: "user", content: options.query },
              ],
            }),
          });
          const data = await res.json();
          if (res.ok && data.success && data.content) {
            markdown = data.content;
            modelName = `Ollama (${data.model || targetModel})`;
            break;
          }
          lastErr = data.error || `Model ${targetModel} not available`;
          if (isModelUnavailableStatus(res.status)) {
            console.warn(`[Ollama] Model ${targetModel} unavailable (${res.status}): ${lastErr}`);
          }
        } catch (e: unknown) {
          lastErr = e instanceof Error ? e.message : "Ollama connection error";
          console.warn(`[Ollama] Model ${targetModel} failed:`, lastErr);
        }
      }

      if (!markdown) {
        throw new Error(lastErr || "Could not query local Ollama. Please ensure `ollama serve` is running.");
      }
    } else if (provider === "gemini") {
      const apiKeys = getStoredApiKeys("gemini");
      const keysToUse = apiKeys.length > 0 ? apiKeys : [apiKey];
      let cleanModel = (modelName || "gemini-1.5-flash").replace(/^models\//, "").trim();
      if (cleanModel.includes("3.6") || cleanModel.includes("2.5") || !cleanModel) {
        cleanModel = "gemini-1.5-flash";
      }

      // Dynamic model discovery for Gemini API keys
      let discoveredModels: string[] = [];
      for (const k of keysToUse) {
        try {
          for (const apiVer of ["v1beta", "v1"]) {
            const listRes = await fetch(`https://generativelanguage.googleapis.com/${apiVer}/models?key=${k.trim()}`);
            if (listRes.ok) {
              const listData = await listRes.json();
              const valid = (listData.models || [])
                .filter((m: any) =>
                  (m.supportedGenerationMethods || []).some((method: string) =>
                    method.includes("generateContent")
                  )
                )
                .map((m: any) => m.name.replace(/^models\//, ""));
              if (valid.length > 0) {
                discoveredModels.push(...valid);
                break;
              }
            }
          }
        } catch {}
      }

      const baseModelsToTry = buildModelsToTry(cleanModel, GEMINI_FALLBACK_MODELS);
      const modelsToTry = Array.from(new Set([...discoveredModels, ...baseModelsToTry]));
      let lastErrorMsg = "";

      geminiLoop: for (const targetModel of modelsToTry) {
        for (const k of keysToUse) {
          for (const apiVer of ["v1beta", "v1"]) {
            try {
              const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${targetModel}:generateContent?key=${k.trim()}`;
              const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: `${systemPrompt}\n\nSTUDENT EXAM QUESTION:\n${options.query}` }] }],
                  generationConfig: { temperature: 0.2, maxOutputTokens: 1500 },
                }),
              });

              if (res.ok) {
                const data = await res.json();
                markdown = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
                if (markdown) {
                  modelName = targetModel;
                  break geminiLoop;
                }
              } else {
                const errJson = await res.json().catch(() => ({}));
                lastErrorMsg = errJson?.error?.message || `Gemini API error (Status ${res.status})`;
                if (isModelUnavailableStatus(res.status)) {
                  console.warn(`[Gemini ${apiVer}] Model ${targetModel} unavailable (${res.status}): ${lastErrorMsg}`);
                  continue;
                }
              }
            } catch (e: unknown) {
              lastErrorMsg = e instanceof Error ? e.message : "Gemini fetch error";
            }
          }
        }
      }

      if (!markdown) {
        throw new Error(lastErrorMsg || "All Gemini models/keys failed to generate response.");
      }
    } else if (provider === "groq") {
      const apiKeys = getStoredApiKeys("groq");
      const keysToUse = apiKeys.length > 0 ? apiKeys : [apiKey];
      const modelsToTry = buildModelsToTry(modelName || "llama-3.1-8b-instant", GROQ_FALLBACK_MODELS);
      let lastErrorMsg = "";

      groqLoop: for (const targetModel of modelsToTry) {
        for (const k of keysToUse) {
          try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${k.trim()}`,
              },
              body: JSON.stringify({
                model: targetModel,
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: options.query },
                ],
                temperature: 0.2,
                max_tokens: 1500,
              }),
            });

            if (res.ok) {
              const data = await res.json();
              markdown = data?.choices?.[0]?.message?.content || "";
              if (markdown) {
                modelName = targetModel;
                break groqLoop;
              }
            } else {
              const errJson = await res.json().catch(() => ({}));
              lastErrorMsg = errJson?.error?.message || `Groq API error (Status ${res.status})`;
              if (isModelUnavailableStatus(res.status)) {
                console.warn(`[Groq] Model ${targetModel} unavailable (${res.status}): ${lastErrorMsg}`);
                continue groqLoop;
              }
            }
          } catch (e: unknown) {
            lastErrorMsg = e instanceof Error ? e.message : "Groq fetch error";
          }
        }
      }

      if (!markdown) {
        throw new Error(lastErrorMsg || "All Groq models/keys failed to generate response.");
      }
    } else if (provider === "openai") {
      const apiKeys = getStoredApiKeys("openai");
      const keysToUse = apiKeys.length > 0 ? apiKeys : [apiKey];
      const modelsToTry = buildModelsToTry(modelName || "gpt-4o-mini", OPENAI_FALLBACK_MODELS);
      let lastErrorMsg = "";

      openaiLoop: for (const targetModel of modelsToTry) {
        for (const k of keysToUse) {
          try {
            const res = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${k.trim()}`,
              },
              body: JSON.stringify({
                model: targetModel,
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: options.query },
                ],
                temperature: 0.2,
                max_tokens: 1500,
              }),
            });

            if (res.ok) {
              const data = await res.json();
              markdown = data?.choices?.[0]?.message?.content || "";
              if (markdown) {
                modelName = targetModel;
                break openaiLoop;
              }
            } else {
              const errJson = await res.json().catch(() => ({}));
              lastErrorMsg = errJson?.error?.message || `OpenAI API error (Status ${res.status})`;
              if (isModelUnavailableStatus(res.status)) {
                console.warn(`[OpenAI] Model ${targetModel} unavailable (${res.status}): ${lastErrorMsg}`);
                continue openaiLoop;
              }
            }
          } catch (e: unknown) {
            lastErrorMsg = e instanceof Error ? e.message : "OpenAI fetch error";
          }
        }
      }

      if (!markdown) {
        throw new Error(lastErrorMsg || "All OpenAI models/keys failed to generate response.");
      }
    }

    return {
      query: options.query,
      provider,
      model: modelName,
      scopeTitle,
      markdown,
      latencyMs: Date.now() - startTime,
      isMockDemo: false,
    };
  } catch (error: unknown) {
    console.error("AI Search API failed:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown API error";
    return {
      query: options.query,
      provider,
      model: `${AI_PROVIDERS[provider].name} (Error)`,
      scopeTitle,
      markdown: `### ⚠️ Could Not Complete AI Query
  
**Error Details:** ${errorMsg}

#### 💡 Troubleshooting:
- If using **Ollama**, verify that Ollama is running in your background (\`ollama serve\`) and that your model is active.
- If using **Cloud Providers** (Gemini, Groq, OpenAI), verify your API key in the top header.
- You can switch to **Google Gemini (Free)** in 1 click using the API Key button in the header.`,
      latencyMs: Date.now() - startTime,
      isMockDemo: true,
    };
  }
}


// ----------------- Fallback Curriculum Generator -----------------

function generateCurriculumMockResponse(query: string, scopeTitle: string): string {
  const q = query.toLowerCase();

  if (q.includes("dijkstra") || q.includes("shortest path") || q.includes("graph")) {
    return `### 🎯 Executive Summary
**Dijkstra's Algorithm** is a greedy graph-search algorithm that computes the single-source shortest path for weighted directed or undirected graphs with non-negative edge weights. It iteratively expands the closest unvisited vertex using relaxation.

### 📝 Exam-Ready Solution / Breakdown
1. **Initialization:** Set \`dist[source] = 0\` and all other vertices to \`+∞\`. Mark all vertices as unvisited.
2. **Min-Priority Extraction:** Extract the vertex \`u\` with the minimum distance from the unvisited set.
3. **Edge Relaxation:** For each neighbor \`v\` of \`u\`:
   - If \`dist[u] + weight(u, v) < dist[v]\`, update \`dist[v] = dist[u] + weight(u, v)\`.
4. **Termination:** Repeat until all vertices have been visited or priority queue is empty.

\`\`\`
Source (A) --4--> (B) --2--> (C)
  |                ^
  +-------1--------+  (Relaxation picks A -> B = 1 over A -> B = 4)
\`\`\`

### ⚡ Key Formulas & Complexity
- **Time Complexity (Adjacency Matrix + Array):** $O(V^2)$
- **Time Complexity (Binary Min-Heap + Adj List):** $O((V + E) \\log V)$
- **Time Complexity (Fibonacci Heap):** $O(E + V \\log V)$ — *Theoretical optimum*
- **Space Complexity:** $O(V)$ for distance & predecessor arrays.

### ⚠️ Common Exam Pitfalls & Examiner Traps
- **Negative Edge Weights:** Dijkstra fails when negative edges exist because once a node is settled, it is never re-examined. For negative weights, mention **Bellman-Ford Algorithm** ($O(V \\cdot E)$).
- **Forgetting to check visited set:** Inserting duplicates into binary heaps without a \`visited\` check increases runtime to $O(E \\log E)$.

### 💡 Likely Exam Questions (PYQ)
1. *(7 Marks)* Explain Dijkstra's algorithm with an example trace table. Why does it fail for negative edge cycles?
2. *(5 Marks)* Compare time complexities of Dijkstra using an array, a binary heap, and a Fibonacci heap.`;
  }

  if (q.includes("avl") || q.includes("tree") || q.includes("rotation") || q.includes("red black")) {
    return `### 🎯 Executive Summary
An **AVL Tree** is a strictly self-balancing Binary Search Tree (BST) where the heights of the two child subtrees of any node differ by at most 1 (Balance Factor $\\in \\{-1, 0, 1\\}$). It guarantees strict $O(\\log n)$ search, insert, and delete operations.

### 📝 Exam-Ready Solution / Breakdown
**Balance Factor (BF) Formula:**
$$\\text{Balance Factor} = \\text{Height}(\\text{Left Subtree}) - \\text{Height}(\\text{Right Subtree})$$

**4 Required Rotations to Restore Balance:**
1. **LL (Left-Left) Imbalance:** Fixed by a **Single Right Rotation**.
2. **RR (Right-Right) Imbalance:** Fixed by a **Single Left Rotation**.
3. **LR (Left-Right) Imbalance:** Double rotation: **Left rotation** on child, then **Right rotation** on root.
4. **RL (Right-Left) Imbalance:** Double rotation: **Right rotation** on child, then **Left rotation** on root.

### ⚡ Key Formulas & Complexity
- **Search Time:** $O(\\log n)$
- **Insertion Time:** $O(\\log n)$ (at most 1 single or double rotation required)
- **Deletion Time:** $O(\\log n)$ (may trigger up to $O(\\log n)$ rotations up to root)
- **Max Height:** $h < 1.44 \\log_2(n + 2) - 0.328$

### ⚠️ Common Exam Pitfalls & Examiner Traps
- **Confusing AVL vs Red-Black:** AVL is more strictly balanced, resulting in faster lookup times than Red-Black trees, but slower insertions and deletions due to frequent rebalancing rotations.
- **Node Balance calculation:** Don't forget that leaf nodes have a height of 0 or 1 depending on convention; state your height definition explicitly on the answer sheet.

### 💡 Likely Exam Questions (PYQ)
1. *(10 Marks)* Construct an AVL Tree by inserting the following sequence: \`[45, 20, 60, 15, 25, 5, 22]\`. Show intermediate rotations.
2. *(5 Marks)* Prove why the worst-case height of an AVL tree with $n$ nodes is $O(\\log n)$.`;
  }

  if (q.includes("deadlock") || q.includes("banker") || q.includes("process") || q.includes("os")) {
    return `### 🎯 Executive Summary
A **Deadlock** in Operating Systems is a state where a set of concurrent processes are blocked because each process holds a resource and waits for another resource held by another process in the set, creating a circular wait cycle.

### 📝 Exam-Ready Solution / Breakdown
**Coffman's 4 Necessary Conditions (All 4 must hold simultaneously):**
1. **Mutual Exclusion:** At least one resource must be held in a non-shareable mode.
2. **Hold and Wait:** A process holds at least one resource and is waiting to acquire additional resources held by other processes.
3. **No Preemption:** Resources cannot be forcibly confiscated; they can only be released voluntarily.
4. **Circular Wait:** A closed chain of processes exists where $P_0$ waits for $P_1$, $P_1$ waits for $P_2$, ..., and $P_n$ waits for $P_0$.

### ⚡ Key Formulas & Complexity
- **Banker's Algorithm (Deadlock Avoidance):**
  - Vectors: $\\text{Available}[m]$, $\\text{Max}[n][m]$, $\\text{Allocation}[n][m]$
  - Need Matrix: $\\text{Need}[i][j] = \\text{Max}[i][j] - \\text{Allocation}[i][j]$
  - Safety Check Time Complexity: $O(m \\cdot n^2)$ where $n = \\text{processes}$, $m = \\text{resources}$.

### ⚠️ Common Exam Pitfalls & Examiner Traps
- **Deadlock Prevention vs Avoidance vs Detection:**
  - *Prevention:* Invalidate at least one of Coffman's 4 conditions statically.
  - *Avoidance:* Banker's algorithm dynamically inspects resource request states.
  - *Detection:* Let deadlock occur, detect with Resource Allocation Graph (RAG), and recover (kill process/preempt resource).

### 💡 Likely Exam Questions (PYQ)
1. *(10 Marks)* Explain Banker's algorithm with a numerical example having 5 processes and 3 resource types $(A, B, C)$. Compute safe sequence.
2. *(5 Marks)* State and explain the 4 Coffman conditions for deadlock occurrence.`;
  }

  // Default syllabus-aware generic response
  return `### 🎯 Executive Summary
Here is the core university examination breakdown for **"${query}"** in the context of **${scopeTitle}**. This topic frequently tests fundamental definitions, state diagrams, and analytical comparisons.

### 📝 Exam-Ready Solution / Breakdown
1. **Definition & Purpose:**
   - Clearly establish what the concept accomplishes in computing and system design.
   - Contrast with preceding or alternative methodologies.
2. **Core Operational Mechanism:**
   - Step 1: Input preprocessing and boundary validation.
   - Step 2: Main processing loop with invariant guarantees.
   - Step 3: Output generation and state stabilization.
3. **Architectural Trade-offs:**
   - Scalability vs memory footprint.
   - Latency vs data consistency guarantees.

### ⚡ Key Formulas & Complexity
- **Time Complexity:** $O(n \\log n)$ average case, $O(n^2)$ worst case without balancing.
- **Space Overhead:** $O(n)$ auxiliary memory for recursion call stack and hash tables.

### ⚠️ Common Exam Pitfalls & Examiner Traps
- Forgetting to write the base condition in recursive formulations.
- Ignoring edge cases (null pointers, empty graphs, single-node trees).
- Not stating assumptions regarding hardware, word size, or indexing (0-based vs 1-based).

### 💡 Likely Exam Questions (PYQ)
1. *(8 Marks)* Differentiate between static and dynamic approaches with respect to this topic. Provide pseudo-code.
2. *(6 Marks)* Describe the time-space trade-off and analyze its performance under worst-case inputs.`;
}
