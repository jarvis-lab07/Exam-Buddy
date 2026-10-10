import { FeatureKey, FeatureRoutingPolicy, RoutingMode, AIProvider } from "./types";
import { getEnabledModels, getModelRegistry } from "./model-registry";

export const DEFAULT_FEATURE_POLICIES: FeatureRoutingPolicy[] = [
  {
    featureKey: "chat",
    featureName: "AI Tutor Chat",
    primaryModelId: "gemini-1.5-flash",
    fallbackModelId: "gpt-4o-mini",
    autoRoutingEnabled: true,
  },
  {
    featureKey: "lecture_tutor",
    featureName: "YouTube Lecture AI Tutor",
    primaryModelId: "gemini-1.5-flash",
    fallbackModelId: "groq-llama-3.3-70b",
    autoRoutingEnabled: true,
  },
  {
    featureKey: "notes",
    featureName: "Lecture & Syllabus Notes Generator",
    primaryModelId: "claude-3-5-sonnet",
    fallbackModelId: "gemini-1.5-pro",
    autoRoutingEnabled: true,
  },
  {
    featureKey: "quiz",
    featureName: "Quiz & MCQ Generator",
    primaryModelId: "groq-llama-3.3-70b",
    fallbackModelId: "gpt-4o-mini",
    autoRoutingEnabled: true,
  },
  {
    featureKey: "flashcards",
    featureName: "Flashcard Generator",
    primaryModelId: "gpt-4o-mini",
    fallbackModelId: "gemini-1.5-flash",
    autoRoutingEnabled: true,
  },
  {
    featureKey: "translation",
    featureName: "Academic Translator (Hindi/Hinglish)",
    primaryModelId: "groq-mixtral-8x7b",
    fallbackModelId: "gemini-1.5-flash",
    autoRoutingEnabled: true,
  },
  {
    featureKey: "vision",
    featureName: "Diagram & Handwritten Math Vision",
    primaryModelId: "gemini-1.5-flash",
    fallbackModelId: "gpt-4o",
    autoRoutingEnabled: true,
  },
  {
    featureKey: "search",
    featureName: "Search Answering & Web RAG",
    primaryModelId: "gemini-1.5-flash",
    fallbackModelId: "groq-llama-3.3-70b",
    autoRoutingEnabled: true,
  },
];

const STORAGE_KEY_ROUTING = "exam_buddy_feature_routing";
const STORAGE_KEY_ROUTING_MODE = "exam_buddy_routing_mode";

export function getFeaturePolicies(): FeatureRoutingPolicy[] {
  if (typeof window === "undefined") return DEFAULT_FEATURE_POLICIES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ROUTING);
    if (stored) {
      const parsed: FeatureRoutingPolicy[] = JSON.parse(stored);
      return DEFAULT_FEATURE_POLICIES.map((def) => {
        const match = parsed.find((p) => p.featureKey === def.featureKey);
        return match ? { ...def, ...match } : def;
      });
    }
  } catch (e) {
    console.error("Failed to load feature policies:", e);
  }
  return DEFAULT_FEATURE_POLICIES;
}

export function saveFeaturePolicies(policies: FeatureRoutingPolicy[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_ROUTING, JSON.stringify(policies));
  } catch (e) {
    console.error("Failed to save feature policies:", e);
  }
}

export function getRoutingMode(): RoutingMode {
  if (typeof window === "undefined") return "feature_policy";
  try {
    const mode = localStorage.getItem(STORAGE_KEY_ROUTING_MODE);
    if (mode && (mode === "manual" || mode === "auto" || mode === "feature_policy")) {
      return mode as RoutingMode;
    }
  } catch (e) {
    console.error(e);
  }
  return "feature_policy";
}

export function setRoutingMode(mode: RoutingMode): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_ROUTING_MODE, mode);
  } catch (e) {
    console.error(e);
  }
}

export function selectModelForFeature(
  featureKey: FeatureKey,
  userModelPreference?: string,
  needVision?: boolean,
  needTools?: boolean
): { primaryModelId: string; fallbackModelId: string } {
  const mode = getRoutingMode();
  const policies = getFeaturePolicies();
  const enabledModels = getEnabledModels();
  const policy = policies.find((p) => p.featureKey === featureKey) || DEFAULT_FEATURE_POLICIES[0];

  // If user requested specific model preference in manual mode or override
  if (userModelPreference && mode === "manual") {
    const preferredModel = enabledModels.find((m) => m.id === userModelPreference);
    if (preferredModel) {
      return {
        primaryModelId: preferredModel.id,
        fallbackModelId: policy.fallbackModelId || "gemini-1.5-flash",
      };
    }
  }

  // Vision requirement check
  if (needVision) {
    const visionModel = enabledModels.find((m) => m.visionSupport);
    if (visionModel) {
      return {
        primaryModelId: visionModel.id,
        fallbackModelId: policy.fallbackModelId,
      };
    }
  }

  // Feature policy routing mode
  const primaryModel = enabledModels.find((m) => m.id === policy.primaryModelId);
  const fallbackModel = enabledModels.find((m) => m.id === policy.fallbackModelId);

  return {
    primaryModelId: primaryModel ? primaryModel.id : enabledModels[0]?.id || "gemini-1.5-flash",
    fallbackModelId: fallbackModel ? fallbackModel.id : "gpt-4o-mini",
  };
}
