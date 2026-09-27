import { ModelMetadata, AIProvider } from "./types";

export const DEFAULT_MODELS: ModelMetadata[] = [
  // Google Gemini
  {
    id: "gemini-2.5-flash",
    provider: "gemini",
    displayName: "Gemini 2.5 Flash",
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    streamingSupport: true,
    visionSupport: true,
    toolCallingSupport: true,
    enabled: true,
    priority: 1,
    notes: "Recommended for fast response, high accuracy & large syllabus context.",
  },
  {
    id: "gemini-2.5-pro",
    provider: "gemini",
    displayName: "Gemini 2.5 Pro",
    contextWindow: 2000000,
    maxOutputTokens: 8192,
    streamingSupport: true,
    visionSupport: true,
    toolCallingSupport: true,
    enabled: true,
    priority: 2,
    notes: "Deep reasoning & complex math / coding proof solving.",
  },

  // OpenAI
  {
    id: "gpt-4o",
    provider: "openai",
    displayName: "GPT-4o (Omni)",
    contextWindow: 128000,
    maxOutputTokens: 4096,
    streamingSupport: true,
    visionSupport: true,
    toolCallingSupport: true,
    enabled: true,
    priority: 1,
    notes: "Industry standard multimodal model for advanced tutoring.",
  },
  {
    id: "gpt-4o-mini",
    provider: "openai",
    displayName: "GPT-4o Mini",
    contextWindow: 128000,
    maxOutputTokens: 4096,
    streamingSupport: true,
    visionSupport: true,
    toolCallingSupport: true,
    enabled: true,
    priority: 2,
    notes: "Lightweight, ultra-fast model for quick quiz and flashcard generation.",
  },

  // Groq
  {
    id: "groq-llama-3.3-70b",
    provider: "groq",
    displayName: "Groq Llama 3.3 70B",
    contextWindow: 128000,
    maxOutputTokens: 4096,
    streamingSupport: true,
    visionSupport: false,
    toolCallingSupport: true,
    enabled: true,
    priority: 1,
    notes: "Ultra low-latency LPU inferencing (500+ tokens/sec).",
  },
  {
    id: "groq-mixtral-8x7b",
    provider: "groq",
    displayName: "Groq Mixtral 8x7B",
    contextWindow: 32000,
    maxOutputTokens: 4096,
    streamingSupport: true,
    visionSupport: false,
    toolCallingSupport: false,
    enabled: true,
    priority: 2,
    notes: "High speed mixture of experts for quick translation & summaries.",
  },

  // Anthropic
  {
    id: "claude-3-5-sonnet",
    provider: "anthropic",
    displayName: "Claude 3.5 Sonnet",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    streamingSupport: true,
    visionSupport: true,
    toolCallingSupport: true,
    enabled: true,
    priority: 1,
    notes: "Superior technical writing & step-by-step academic explanations.",
  },

  // Ollama Local
  {
    id: "ollama-llama3",
    provider: "ollama",
    displayName: "Ollama Llama 3 (Local)",
    contextWindow: 8192,
    maxOutputTokens: 2048,
    streamingSupport: true,
    visionSupport: false,
    toolCallingSupport: false,
    enabled: true,
    priority: 1,
    notes: "100% private local LLM running on your device via Ollama server.",
  },
  {
    id: "ollama-mistral",
    provider: "ollama",
    displayName: "Ollama Mistral 7B (Local)",
    contextWindow: 8192,
    maxOutputTokens: 2048,
    streamingSupport: true,
    visionSupport: false,
    toolCallingSupport: false,
    enabled: true,
    priority: 2,
    notes: "Fast local model for offline study note generation.",
  },
];

const STORAGE_KEY_MODELS = "exam_buddy_model_registry";

export function getModelRegistry(): ModelMetadata[] {
  if (typeof window === "undefined") return DEFAULT_MODELS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MODELS);
    if (stored) {
      const parsed: ModelMetadata[] = JSON.parse(stored);
      // Merge defaults with stored state to preserve newly added default models
      return DEFAULT_MODELS.map((def) => {
        const match = parsed.find((p) => p.id === def.id);
        return match ? { ...def, enabled: match.enabled, priority: match.priority } : def;
      });
    }
  } catch (e) {
    console.error("Failed to load model registry from localStorage:", e);
  }
  return DEFAULT_MODELS;
}

export function saveModelRegistry(models: ModelMetadata[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_MODELS, JSON.stringify(models));
  } catch (e) {
    console.error("Failed to save model registry to localStorage:", e);
  }
}

export function toggleModelStatus(modelId: string, enabled?: boolean): ModelMetadata[] {
  const models = getModelRegistry();
  const updated = models.map((m) =>
    m.id === modelId ? { ...m, enabled: enabled !== undefined ? enabled : !m.enabled } : m
  );
  saveModelRegistry(updated);
  return updated;
}

export function getEnabledModels(provider?: AIProvider): ModelMetadata[] {
  const models = getModelRegistry().filter((m) => m.enabled);
  if (provider) return models.filter((m) => m.provider === provider);
  return models;
}
