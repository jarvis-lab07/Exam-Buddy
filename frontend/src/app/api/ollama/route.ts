import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, endpoint = "http://localhost:11434", model, messages, prompt } = body;

    const cleanEndpoint = endpoint.replace(/\/+$/, "");

    // 1. Health check & list installed models
    if (action === "ping" || action === "tags") {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(`${cleanEndpoint}/api/tags`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          return NextResponse.json(
            {
              success: false,
              error: `Ollama responded with HTTP ${res.status}`,
            },
            { status: res.status }
          );
        }

        const data = await res.json();
        const models = (data.models || []).map((m: { name: string; size?: number }) => ({
          name: m.name,
          sizeMb: m.size ? Math.round(m.size / (1024 * 1024)) : undefined,
        }));

        return NextResponse.json({
          success: true,
          models,
          count: models.length,
        });
      } catch (err: unknown) {
        const isAbort = err instanceof Error && err.name === "AbortError";
        return NextResponse.json(
          {
            success: false,
            error: isAbort
              ? "Connection to Ollama timed out. Make sure Ollama is running (`ollama serve`)."
              : "Could not reach Ollama at " + cleanEndpoint + ". Is Ollama running on your device?",
          },
          { status: 503 }
        );
      }
    }

    // 2. Chat completion with auto-model detection & performance optimizations
    if (action === "chat") {
      // First, fetch available models to guarantee we don't request a missing model
      let effectiveModel = model || "llama3:latest";

      try {
        const tagsRes = await fetch(`${cleanEndpoint}/api/tags`);
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          const availableModels: string[] = (tagsData.models || []).map((m: { name: string }) => m.name);

          if (availableModels.length > 0) {
            // Check if requested model exists
            const exactMatch = availableModels.find((m) => m === effectiveModel);
            const prefixMatch = availableModels.find(
              (m) => m.startsWith(effectiveModel) || effectiveModel.startsWith(m.split(":")[0])
            );

            if (exactMatch) {
              effectiveModel = exactMatch;
            } else if (prefixMatch) {
              effectiveModel = prefixMatch;
            } else {
              // Auto-fallback to the first installed model!
              effectiveModel = availableModels[0];
            }
          }
        }
      } catch {
        // Continue with specified model if tags check fails
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout

      const payload = {
        model: effectiveModel,
        messages: messages || [{ role: "user", content: prompt || "Hello" }],
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 500, // Limit token generation so local CPU doesn't hang or take minutes
        },
      };

      try {
        const res = await fetch(`${cleanEndpoint}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData?.error || `HTTP ${res.status}: Ollama failed to generate`;
          return NextResponse.json({ success: false, error: errMsg }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json({
          success: true,
          content: data?.message?.content || "",
          model: data?.model || effectiveModel,
          totalDurationMs: data?.total_duration ? Math.round(data.total_duration / 1e6) : undefined,
          loadDurationMs: data?.load_duration ? Math.round(data.load_duration / 1e6) : undefined,
        });
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        const isAbort = err instanceof Error && err.name === "AbortError";
        const errMsg = isAbort
          ? "Local generation timed out (exceeded 90 seconds). Try asking a shorter question or running a smaller model (e.g. `ollama run llama3.2:1b`)."
          : err instanceof Error
          ? err.message
          : "Error querying local Ollama";

        return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
      }
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Supported: 'ping', 'tags', 'chat'" },
      { status: 400 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
