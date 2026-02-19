/**
 * GeniusPro Cat API client with progress updates.
 * Copy this file into your project to connect to the progress feed.
 *
 * Usage:
 *   const result = await runCatWithProgress({
 *     apiUrl: "https://api.geniuspro.io",
 *     accessToken: "your-jwt-or-api-key",
 *     catSlug: "gutter-system",
 *     userMessage: "Analyze this image.",
 *     imageUrl: "https://...",
 *     onProgress: (u) => console.log(`Step ${u.step}: ${u.message}`),
 *   });
 */

export type ProgressUpdate = {
  step: number;
  totalSteps: number;
  stepName: string;
  message: string;
};

export type CatRunResult = {
  text: string;
  debugSteps?: Array<{
    index: number;
    client_model: string;
    provider_model: string;
    duration_ms: number;
    output_text: string;
    parsed_json: unknown | null;
  }>;
};

export async function runCatWithProgress(args: {
  /** API base URL (e.g. https://api.geniuspro.io or your platform proxy) */
  apiUrl: string;
  /** JWT or API key */
  accessToken: string;
  /** Cat slug (e.g. "gutter-system") */
  catSlug: string;
  /** User message / prompt */
  userMessage: string;
  /** Optional image URL (https:// or data:image/...) */
  imageUrl?: string;
  /** Optional: run only through step N (for debugging) */
  debugRunStep?: number;
  /** Called with each progress update */
  onProgress?: (update: ProgressUpdate) => void;
}): Promise<CatRunResult> {
  const base = args.apiUrl.replace(/\/$/, "");
  const url = `${base}/chat/completions`;

  const contentParts: Array<Record<string, unknown>> = [];
  if (args.userMessage.trim()) {
    contentParts.push({ type: "text", text: args.userMessage.trim() });
  }
  if (args.imageUrl?.trim()) {
    contentParts.push({ type: "image_url", image_url: { url: args.imageUrl.trim() } });
  }
  if (contentParts.length === 0) {
    throw new Error("Provide userMessage or imageUrl");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      Authorization: `Bearer ${args.accessToken}`,
    },
    body: JSON.stringify({
      model: `cat:${args.catSlug}`,
      stream: false,
      cat_draft: true,
      debug_pipeline: true,
      progress_updates: true,
      ...(typeof args.debugRunStep === "number" && args.debugRunStep > 0
        ? { debug_run_step: Math.floor(args.debugRunStep) }
        : {}),
      messages: [{ role: "user", content: contentParts }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("text/event-stream") && res.body) {
    return consumeProgressStream(res, args.onProgress);
  }

  const data = (await res.json()) as Record<string, unknown>;
  return parseCompletionResponse(data);
}

async function consumeProgressStream(
  res: Response,
  onProgress?: (u: ProgressUpdate) => void
): Promise<CatRunResult> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalData: Record<string, unknown> | null = null;
  let errorMessage: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (!payload) continue;
      try {
        const parsed = JSON.parse(payload) as Record<string, unknown>;
        const type = parsed.type as string | undefined;
        if (type === "progress") {
          onProgress?.({
            step: Number(parsed.step) ?? 0,
            totalSteps: Number(parsed.totalSteps) ?? 0,
            stepName: String(parsed.stepName ?? ""),
            message: String(parsed.message ?? ""),
          });
        } else if (type === "complete") {
          const data = parsed.data as Record<string, unknown>;
          if (data) finalData = data;
        } else if (type === "error") {
          errorMessage = String(parsed.message ?? "Unknown error");
        }
      } catch {
        // ignore malformed lines
      }
    }
  }

  if (errorMessage) throw new Error(errorMessage);
  if (!finalData) throw new Error("No complete event in progress stream");
  return parseCompletionResponse(finalData);
}

function parseCompletionResponse(data: Record<string, unknown>): CatRunResult {
  const choices = data.choices as Array<{ message?: { content?: unknown } }> | undefined;
  const content = choices?.[0]?.message?.content;
  const text = typeof content === "string" ? content : JSON.stringify(content ?? "");
  const debug = data.debug as { pipeline_steps?: CatRunResult["debugSteps"] } | undefined;
  const debugSteps = Array.isArray(debug?.pipeline_steps) ? debug.pipeline_steps : undefined;
  return { text, debugSteps };
}
