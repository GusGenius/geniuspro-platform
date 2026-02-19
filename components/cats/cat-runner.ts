"use client";

export type CatRunDebugStep = {
  index: number;
  client_model: string;
  provider_model: string;
  duration_ms: number;
  output_text: string;
  parsed_json: unknown | null;
};

export type ProgressUpdate = {
  step: number;
  totalSteps: number;
  stepName: string;
  message: string;
};

export async function runCatOnce(args: {
  accessToken: string;
  catSlug: string;
  userMessage: string;
  imageUrl?: string;
  debugPipeline?: boolean;
  debugRunStep?: number;
  draftRun?: boolean;
  /** When true, requests SSE progress stream. Requires onProgress to consume updates. */
  progressUpdates?: boolean;
  /** Called with progress updates when progressUpdates is true. */
  onProgress?: (update: ProgressUpdate) => void;
}): Promise<{ text: string; debugSteps?: CatRunDebugStep[] }> {
  const message = args.userMessage.trim();
  const hasImage = !!(args.imageUrl && args.imageUrl.trim());
  if (!message && !hasImage) throw new Error("Enter a prompt or add an image to test.");
  const model = `cat:${args.catSlug}`;

  const contentParts: Array<Record<string, unknown>> = [];
  if (message) {
    contentParts.push({ type: "text", text: message });
  }
  if (hasImage) {
    contentParts.push({ type: "image_url", image_url: { url: args.imageUrl!.trim() } });
  }

  const res = await fetch("/api/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${args.accessToken}`,
    },
    body: JSON.stringify({
      model,
      stream: false,
      cat_draft: args.draftRun !== false,
      debug_pipeline: args.debugPipeline === true,
      progress_updates: args.progressUpdates === true,
      ...(typeof args.debugRunStep === "number" && args.debugRunStep > 0
        ? { debug_run_step: Math.floor(args.debugRunStep) }
        : {}),
      messages: [{ role: "user", content: contentParts }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Test run failed");
  }

  const contentType = res.headers.get("content-type") ?? "";
  const isSSE = contentType.includes("text/event-stream");
  if (isSSE && args.progressUpdates && res.body) {
    return consumeProgressStream(res, args.onProgress);
  }
  if (args.progressUpdates && !isSSE) {
    console.warn(
      "[runCatOnce] progress_updates requested but API returned",
      contentType || "(no content-type)",
      "- progress stream not available. Ensure geniuspro-api is deployed with progress support."
    );
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
    debug?: { pipeline_steps?: CatRunDebugStep[] };
  };
  const content = data.choices?.[0]?.message?.content;
  const text = typeof content === "string" ? content : JSON.stringify(content ?? "");
  const debugSteps = Array.isArray(data.debug?.pipeline_steps)
    ? data.debug?.pipeline_steps
    : undefined;
  return { text, debugSteps };
}

async function consumeProgressStream(
  res: Response,
  onProgress?: (u: ProgressUpdate) => void
): Promise<{ text: string; debugSteps?: CatRunDebugStep[] }> {
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
        // ignore
      }
    }
  }

  if (errorMessage) throw new Error(errorMessage);
  if (!finalData) throw new Error("No complete event in progress stream");

  const content = (finalData.choices as Array<{ message?: { content?: unknown } }>)?.[0]?.message?.content;
  const text = typeof content === "string" ? content : JSON.stringify(content ?? "");
  const debugSteps = Array.isArray((finalData.debug as { pipeline_steps?: CatRunDebugStep[] })?.pipeline_steps)
    ? (finalData.debug as { pipeline_steps: CatRunDebugStep[] }).pipeline_steps
    : undefined;
  return { text, debugSteps };
}

