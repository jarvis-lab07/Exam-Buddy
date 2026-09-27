import { AIRequestLog, GatewayResponse, FeatureKey, AIProvider, ErrorCategory } from "./types";

const STORAGE_KEY_LOGS = "exam_buddy_ai_request_logs";
const MAX_LOG_COUNT = 100;

export function getAIRequestLogs(): AIRequestLog[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_LOGS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load AI request logs:", e);
  }
  return [];
}

export function logAIResponse(response: GatewayResponse, feature: FeatureKey): void {
  if (typeof window === "undefined") return;
  try {
    const currentLogs = getAIRequestLogs();
    const newLog: AIRequestLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      requestId: response.requestId,
      feature,
      provider: response.provider,
      model: response.model,
      status: response.status,
      errorCategory: response.errorCategory,
      latencyMs: response.latencyMs,
      ttftMs: response.timeToFirstTokenMs,
      retryCount: response.retryCount,
      fallbackUsed: response.fallbackUsed,
      promptTokens: response.usage?.promptTokens || 0,
      completionTokens: response.usage?.completionTokens || 0,
      totalTokens: response.usage?.totalTokens || 0,
      timestamp: new Date().toISOString(),
    };

    const updated = [newLog, ...currentLogs].slice(0, MAX_LOG_COUNT);
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save AI request log:", e);
  }
}

export function clearAIRequestLogs(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY_LOGS);
  } catch (e) {
    console.error(e);
  }
}

export interface AIAnalyticsSummary {
  totalRequests: number;
  successRatePercent: number;
  avgLatencyMs: number;
  avgTTFTMs: number;
  totalTokensUsed: number;
  fallbackCount: number;
  errorCount: number;
  providerUsage: Record<AIProvider, number>;
  errorDistribution: Record<string, number>;
}

export function getAIAnalyticsSummary(): AIAnalyticsSummary {
  const logs = getAIRequestLogs();
  if (logs.length === 0) {
    return {
      totalRequests: 0,
      successRatePercent: 100,
      avgLatencyMs: 0,
      avgTTFTMs: 0,
      totalTokensUsed: 0,
      fallbackCount: 0,
      errorCount: 0,
      providerUsage: {
        gemini: 0,
        openai: 0,
        groq: 0,
        ollama: 0,
        anthropic: 0,
      },
      errorDistribution: {},
    };
  }

  const total = logs.length;
  const successful = logs.filter((l) => l.status === "success" || l.status === "fallback_success").length;
  const totalLatency = logs.reduce((acc, l) => acc + l.latencyMs, 0);
  const ttftLogs = logs.filter((l) => l.ttftMs !== undefined && l.ttftMs > 0);
  const totalTTFT = ttftLogs.reduce((acc, l) => acc + (l.ttftMs || 0), 0);
  const totalTokens = logs.reduce((acc, l) => acc + l.totalTokens, 0);
  const fallbacks = logs.filter((l) => l.fallbackUsed).length;
  const errors = logs.filter((l) => l.status === "error").length;

  const providerUsage: Record<AIProvider, number> = {
    gemini: 0,
    openai: 0,
    groq: 0,
    ollama: 0,
    anthropic: 0,
  };

  const errorDistribution: Record<string, number> = {};

  logs.forEach((l) => {
    if (providerUsage[l.provider] !== undefined) {
      providerUsage[l.provider]++;
    }
    if (l.errorCategory) {
      errorDistribution[l.errorCategory] = (errorDistribution[l.errorCategory] || 0) + 1;
    }
  });

  return {
    totalRequests: total,
    successRatePercent: Math.round((successful / total) * 100),
    avgLatencyMs: Math.round(totalLatency / total),
    avgTTFTMs: ttftLogs.length > 0 ? Math.round(totalTTFT / ttftLogs.length) : 0,
    totalTokensUsed: totalTokens,
    fallbackCount: fallbacks,
    errorCount: errors,
    providerUsage,
    errorDistribution,
  };
}
