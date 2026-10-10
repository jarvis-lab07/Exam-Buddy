/** Provider model fallback chains used by streaming + search so deprecated IDs never hard-fail. */

export const GROQ_FALLBACK_MODELS = [
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
] as const;

export const GEMINI_FALLBACK_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash-exp",
  "gemini-2.0-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
  "gemini-2.5-flash",
  "gemini-pro",
] as const;

export const OPENAI_FALLBACK_MODELS = ["gpt-4o-mini", "gpt-3.5-turbo", "gpt-4o"] as const;

export const OLLAMA_FALLBACK_MODELS = ["llama3:latest", "llama3.2:latest", "mistral:latest"] as const;

export function buildModelsToTry(
  requested: string | undefined,
  fallbacks: readonly string[]
): string[] {
  return Array.from(new Set([requested, ...fallbacks].filter(Boolean) as string[]));
}

export function isModelUnavailableStatus(status: number): boolean {
  return status === 400 || status === 404;
}
