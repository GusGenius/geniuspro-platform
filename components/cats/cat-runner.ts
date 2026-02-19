"use client";

export type CatRunDebugStep = {
  index: number;
  client_model: string;
  provider_model: string;
  duration_ms: number;
  output_text: string;
  parsed_json: unknown | null;
};

export async function runCatOnce(args: {
  accessToken: string;
  catSlug: string;
  userMessage: string;
  imageUrl?: string;
  debugPipeline?: boolean;
  debugRunStep?: number;
  draftRun?: boolean;
}): Promise<{ text: string; debugSteps?: CatRunDebugStep[] }> {
  const message = args.userMessage.trim();
  if (!message) throw new Error("Enter something to test.");
  const model = `cat:${args.catSlug}`;

  const contentParts: Array<Record<string, unknown>> = [{ type: "text", text: message }];
  if (args.imageUrl && args.imageUrl.trim()) {
    contentParts.push({ type: "image_url", image_url: { url: args.imageUrl.trim() } });
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

