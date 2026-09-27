import {
  GatewayRequest,
  GatewayResponse,
  AIProvider,
  ErrorCategory,
  GatewayMessage,
} from "./types";
import { selectModelForFeature } from "./feature-router";
import { getModelRegistry } from "./model-registry";
import { logAIResponse } from "./logger";
import { getStoredApiKey } from "../ai-service";

export class AIGateway {
  private static instance: AIGateway;

  public static getInstance(): AIGateway {
    if (!AIGateway.instance) {
      AIGateway.instance = new AIGateway();
    }
    return AIGateway.instance;
  }

  /**
   * Execute an AI request through the AI Gateway.
   * Handles model routing, API key injection, retry, and backup fallback.
   */
  public async execute(request: GatewayRequest): Promise<GatewayResponse> {
    const startTime = Date.now();
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    // Select primary & fallback models
    const { primaryModelId, fallbackModelId } = selectModelForFeature(
      request.feature,
      request.modelPreference
    );

    let retryCount = 0;
    let fallbackUsed = false;
    let timeToFirstTokenMs: number | undefined;

    // Try Primary Model Execution
    try {
      const responseText = await this.dispatchRequest(
        primaryModelId,
        request,
        (chunk) => {
          if (!timeToFirstTokenMs) {
            timeToFirstTokenMs = Date.now() - startTime;
          }
        }
      );

      const gatewayResponse: GatewayResponse = {
        requestId,
        provider: this.getProviderForModel(primaryModelId),
        model: primaryModelId,
        text: responseText,
        status: "success",
        usage: {
          promptTokens: Math.round(request.messages.reduce((a, b) => a + b.content.length, 0) / 4),
          completionTokens: Math.round(responseText.length / 4),
          totalTokens: Math.round(
            (request.messages.reduce((a, b) => a + b.content.length, 0) + responseText.length) / 4
          ),
        },
        latencyMs: Date.now() - startTime,
        timeToFirstTokenMs,
        retryCount: 0,
        fallbackUsed: false,
        timestamp: new Date().toISOString(),
      };

      logAIResponse(gatewayResponse, request.feature);
      return gatewayResponse;
    } catch (primaryError: any) {
      console.warn(`[AI Gateway] Primary model (${primaryModelId}) failed. Attempting retry & fallback. Error:`, primaryError);
      
      // Attempt retry once on primary if timeout/network error
      retryCount++;
      try {
        const retryText = await this.dispatchRequest(primaryModelId, request);
        const gatewayResponse: GatewayResponse = {
          requestId,
          provider: this.getProviderForModel(primaryModelId),
          model: primaryModelId,
          text: retryText,
          status: "success",
          latencyMs: Date.now() - startTime,
          retryCount,
          fallbackUsed: false,
          timestamp: new Date().toISOString(),
        };
        logAIResponse(gatewayResponse, request.feature);
        return gatewayResponse;
      } catch (retryError) {
        console.warn(`[AI Gateway] Retry failed. Switching to Fallback model (${fallbackModelId})...`);
      }

      // Execute Fallback Model
      fallbackUsed = true;
      try {
        const fallbackText = await this.dispatchRequest(fallbackModelId, request);
        const gatewayResponse: GatewayResponse = {
          requestId,
          provider: this.getProviderForModel(fallbackModelId),
          model: fallbackModelId,
          text: fallbackText,
          status: "fallback_success",
          usage: {
            promptTokens: Math.round(request.messages.reduce((a, b) => a + b.content.length, 0) / 4),
            completionTokens: Math.round(fallbackText.length / 4),
            totalTokens: Math.round(
              (request.messages.reduce((a, b) => a + b.content.length, 0) + fallbackText.length) / 4
            ),
          },
          latencyMs: Date.now() - startTime,
          retryCount,
          fallbackUsed: true,
          timestamp: new Date().toISOString(),
        };

        logAIResponse(gatewayResponse, request.feature);
        return gatewayResponse;
      } catch (fallbackError: any) {
        // Both primary & fallback failed
        const errorCategory = this.normalizeError(fallbackError);
        const errorResponse: GatewayResponse = {
          requestId,
          provider: this.getProviderForModel(primaryModelId),
          model: primaryModelId,
          text: "",
          status: "error",
          errorCategory,
          errorMessage: fallbackError?.message || "All configured AI model providers failed to respond.",
          latencyMs: Date.now() - startTime,
          retryCount,
          fallbackUsed: true,
          timestamp: new Date().toISOString(),
        };

        logAIResponse(errorResponse, request.feature);
        return errorResponse;
      }
    }
  }

  /**
   * Streaming execution wrapper for real-time text streaming.
   */
  public async stream(
    request: GatewayRequest,
    onChunk: (chunk: string) => void
  ): Promise<GatewayResponse> {
    const startTime = Date.now();
    const requestId = `req-stream-${Date.now()}`;
    const { primaryModelId, fallbackModelId } = selectModelForFeature(
      request.feature,
      request.modelPreference
    );

    let fullText = "";
    let timeToFirstTokenMs: number | undefined;

    try {
      fullText = await this.dispatchRequest(primaryModelId, request, (chunk) => {
        if (!timeToFirstTokenMs) {
          timeToFirstTokenMs = Date.now() - startTime;
        }
        onChunk(chunk);
      });

      const response: GatewayResponse = {
        requestId,
        provider: this.getProviderForModel(primaryModelId),
        model: primaryModelId,
        text: fullText,
        status: "success",
        usage: {
          promptTokens: Math.round(request.messages.reduce((a, b) => a + b.content.length, 0) / 4),
          completionTokens: Math.round(fullText.length / 4),
          totalTokens: Math.round(
            (request.messages.reduce((a, b) => a + b.content.length, 0) + fullText.length) / 4
          ),
        },
        latencyMs: Date.now() - startTime,
        timeToFirstTokenMs,
        retryCount: 0,
        fallbackUsed: false,
        timestamp: new Date().toISOString(),
      };

      logAIResponse(response, request.feature);
      return response;
    } catch (err: any) {
      // Stream fallback
      console.warn(`[AI Gateway Streaming] Primary model failed. Falling back to (${fallbackModelId})...`);
      try {
        fullText = await this.dispatchRequest(fallbackModelId, request, onChunk);
        const response: GatewayResponse = {
          requestId,
          provider: this.getProviderForModel(fallbackModelId),
          model: fallbackModelId,
          text: fullText,
          status: "fallback_success",
          latencyMs: Date.now() - startTime,
          retryCount: 1,
          fallbackUsed: true,
          timestamp: new Date().toISOString(),
        };
        logAIResponse(response, request.feature);
        return response;
      } catch (fallbackErr: any) {
        const response: GatewayResponse = {
          requestId,
          provider: this.getProviderForModel(primaryModelId),
          model: primaryModelId,
          text: "",
          status: "error",
          errorCategory: this.normalizeError(fallbackErr),
          errorMessage: fallbackErr?.message || "Streaming failed across all available providers.",
          latencyMs: Date.now() - startTime,
          retryCount: 1,
          fallbackUsed: true,
          timestamp: new Date().toISOString(),
        };
        logAIResponse(response, request.feature);
        return response;
      }
    }
  }

  /**
   * Internal dispatcher connecting to standard provider endpoints
   */
  private async dispatchRequest(
    modelId: string,
    request: GatewayRequest,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const provider = this.getProviderForModel(modelId);
    const apiKey = getStoredApiKey(provider);

    // Call Next.js API Gateway route for safe server-side provider execution
    const res = await fetch("/api/ai-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        model: modelId,
        messages: request.messages,
        apiKey,
        task: request.task,
        workspaceContext: request.workspaceContext,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Provider API HTTP Error ${res.status}: ${errText}`);
    }

    // Read SSE stream
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunkStr = decoder.decode(value, { stream: true });
        accumulatedText += chunkStr;
        if (onChunk) {
          onChunk(chunkStr);
        }
      }
    }

    return accumulatedText;
  }

  private getProviderForModel(modelId: string): AIProvider {
    const models = getModelRegistry();
    const found = models.find((m) => m.id === modelId);
    if (found) return found.provider;

    if (modelId.startsWith("gemini")) return "gemini";
    if (modelId.startsWith("gpt")) return "openai";
    if (modelId.startsWith("groq")) return "groq";
    if (modelId.startsWith("ollama")) return "ollama";
    if (modelId.startsWith("claude")) return "anthropic";
    return "gemini";
  }

  private normalizeError(error: any): ErrorCategory {
    const msg = String(error?.message || error).toLowerCase();
    if (msg.includes("401") || msg.includes("invalid key") || msg.includes("api_key")) {
      return "INVALID_API_KEY";
    }
    if (msg.includes("429") || msg.includes("rate limit")) {
      return "RATE_LIMIT";
    }
    if (msg.includes("quota") || msg.includes("insufficient")) {
      return "QUOTA_EXHAUSTED";
    }
    if (msg.includes("timeout") || msg.includes("timed out")) {
      return "TIMEOUT";
    }
    if (msg.includes("context") || msg.includes("token limit")) {
      return "CONTEXT_TOO_LARGE";
    }
    if (msg.includes("fetch failed") || msg.includes("network")) {
      return "NETWORK_ERROR";
    }
    return "UNKNOWN_ERROR";
  }
}

export const aiGateway = AIGateway.getInstance();
