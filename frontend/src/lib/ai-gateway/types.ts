export type AIProvider = "gemini" | "openai" | "groq" | "ollama" | "anthropic";

export type FeatureKey =
  | "chat"
  | "lecture_tutor"
  | "notes"
  | "quiz"
  | "flashcards"
  | "translation"
  | "vision"
  | "search";

export type RoutingMode = "manual" | "auto" | "feature_policy";

export type ErrorCategory =
  | "INVALID_API_KEY"
  | "RATE_LIMIT"
  | "QUOTA_EXHAUSTED"
  | "PROVIDER_UNAVAILABLE"
  | "MODEL_UNAVAILABLE"
  | "CONTEXT_TOO_LARGE"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

export interface ModelMetadata {
  id: string;
  provider: AIProvider;
  displayName: string;
  contextWindow: number;
  maxOutputTokens: number;
  streamingSupport: boolean;
  visionSupport: boolean;
  toolCallingSupport: boolean;
  enabled: boolean;
  priority: number;
  notes?: string;
}

export interface ProviderConfig {
  id: AIProvider;
  name: string;
  logo: string;
  enabled: boolean;
  streamingSupport: boolean;
  visionSupport: boolean;
  toolsSupport: boolean;
  lastHealthCheck?: string;
  status: "connected" | "disconnected" | "error" | "rate_limited";
  keyCount: number;
  baseUrl?: string;
}

export interface FeatureRoutingPolicy {
  featureKey: FeatureKey;
  featureName: string;
  primaryModelId: string;
  fallbackModelId: string;
  autoRoutingEnabled: boolean;
}

export interface GatewayMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: number;
}

export interface GatewayRequest {
  feature: FeatureKey;
  messages: GatewayMessage[];
  task?: string;
  workspaceContext?: Record<string, any>;
  modelPreference?: string;
  providerPreference?: AIProvider;
  streaming?: boolean;
  temperature?: number;
  maxTokens?: number;
  userLanguage?: string;
}

export interface GatewayResponse {
  requestId: string;
  provider: AIProvider;
  model: string;
  text: string;
  status: "success" | "error" | "fallback_success";
  errorCategory?: ErrorCategory;
  errorMessage?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  timeToFirstTokenMs?: number;
  retryCount: number;
  fallbackUsed: boolean;
  timestamp: string;
}

export interface AIRequestLog {
  id: string;
  requestId: string;
  feature: FeatureKey;
  provider: AIProvider;
  model: string;
  status: "success" | "error" | "fallback_success";
  errorCategory?: ErrorCategory;
  latencyMs: number;
  ttftMs?: number;
  retryCount: number;
  fallbackUsed: boolean;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  timestamp: string;
}
