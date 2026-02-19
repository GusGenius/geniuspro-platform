"use client";

import type { CatModelKitten } from "@/components/cats/types";
import { AVAILABLE_MODELS } from "@/components/models/available-models";

type AiGeneratedCat = {
  name: string;
  description: string;
  kittens: Array<Pick<CatModelKitten, "name" | "model_id" | "instructions">>;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function safeModelId(input: string): string {
  const normalized = input.trim();
  if (!normalized) return "gemini-3-flash";
  const exists = AVAILABLE_MODELS.some((m) => m.id === normalized);
  return exists ? normalized : "gemini-3-flash";
}

function parseGeneratedJson(text: string): AiGeneratedCat | null {
  // Try to extract a JSON object even if the model wraps it in prose.
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const raw = text.slice(start, end + 1);
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;
  const name = isNonEmptyString(obj.name) ? obj.name.trim() : "";
  const description =
    typeof obj.description === "string" ? obj.description.trim() : "";
  const kittensRaw = Array.isArray(obj.kittens) ? obj.kittens : [];
  const kittens = kittensRaw
    .map((k) => (k && typeof k === "object" ? (k as Record<string, unknown>) : null))
    .filter(Boolean)
    .map((k) => ({
      name: isNonEmptyString(k!.name) ? String(k!.name).trim() : "Kitten",
      model_id: isNonEmptyString(k!.model_id)
        ? safeModelId(String(k!.model_id))
        : "gemini-3-flash",
      instructions:
        typeof k!.instructions === "string" ? String(k!.instructions).trim() : "",
    }))
    .slice(0, 8);

  if (!name || kittens.length === 0) return null;
  return { name, description, kittens };
}

export async function generateCatFromDescription(args: {
  accessToken: string;
  userPrompt: string;
}): Promise<AiGeneratedCat> {
  const prompt = args.userPrompt.trim();
  if (!prompt) {
    throw new Error("Describe what you want the cat to do.");
  }

  const modelList = AVAILABLE_MODELS.map((m) => `${m.id} (${m.label})`).join(", ");

  const res = await fetch("/api/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${args.accessToken}`,
    },
    body: JSON.stringify({
      model: "geniuspro-agi-1.2",
      stream: false,
      messages: [
        {
          role: "system",
          content: [
            "You generate Cat workflow configurations.",
            "Return ONLY valid JSON. No markdown.",
            "Schema:",
            `{ "name": string, "description": string, "kittens": [{ "name": string, "model_id": string, "instructions": string }] }`,
            "Rules:",
            "- 2 to 5 kittens, ordered",
            "- Each kitten name is a short role label",
            "- model_id must be one of: " + modelList,
          ].join("\n"),
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "AI generation failed");
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: unknown } }> };
  const content = data.choices?.[0]?.message?.content;
  const text = typeof content === "string" ? content : JSON.stringify(content ?? "");
  const parsed = parseGeneratedJson(text);
  if (!parsed) {
    throw new Error("AI returned an invalid config. Try rephrasing.");
  }
  return parsed;
}

