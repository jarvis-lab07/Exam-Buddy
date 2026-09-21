import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, endpoint = "http://localhost:11434", model, messages, prompt } = body;

    const cleanEndpoint = endpoint.replace(/\/+$/, "");

    // 1. Health check & list installed models
    if (action === "ping" || action === "tags") {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

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

    // 2. Chat completion
    if (action === "chat") {
      const selectedModel = model || "llama3.2";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s for local models

      const payload = {
        model: selectedModel,
        messages: messages || [{ role: "user", content: prompt || "Hello" }],
        stream: false,
        options: {
          temperature: 0.2,
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
          const errText = await res.text();
          return NextResponse.json(
            { success: false, error: `Ollama error: ${errText || res.statusText}` },
            { status: res.status }
          );
        }

        const data = await res.json();
        return NextResponse.json({
          success: true,
          content: data?.message?.content || "",
          model: data?.model || selectedModel,
          totalDurationMs: data?.total_duration ? Math.round(data.total_duration / 1e6) : undefined,
        });
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        const errMsg = err instanceof Error ? err.message : "Error querying local Ollama";
        return NextResponse.json(
          { success: false, error: errMsg },
          { status: 500 }
        );
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
