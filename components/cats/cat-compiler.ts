import { serializeRouterInstructions } from "@/components/routers/router-instructions";
import { normalizeSlug } from "@/components/routers/router-form-utils";
import type { CatKitten } from "@/components/cats/types";

export function normalizeKittens(input: CatKitten[]): CatKitten[] {
  const list = Array.isArray(input) ? input : [];
  return list
    .map((k, idx) => ({
      id:
        typeof k?.id === "string" && k.id.trim()
          ? k.id.trim()
          : `kitten-${idx + 1}-${Math.random().toString(16).slice(2, 8)}`,
      name: String(k.name ?? "").trim() || "Kitten",
      model_id: String(k.model_id ?? "").trim() || "gemini-3-flash",
      instructions: String(k.instructions ?? "").trim(),
    }))
    .filter((k) => k.model_id);
}

export function compileCatToRouterInstructions(args: {
  catName: string;
  catDescription: string;
  kittens: CatKitten[];
}): { modelIds: string[]; instructions: string } {
  const kittens = normalizeKittens(args.kittens);
  const modelIds = kittens.map((k) => k.model_id.trim()).filter(Boolean);

  const global = [
    `You are Cat '${args.catName.trim() || "Cat"}'.`,
    args.catDescription.trim() ? `\n${args.catDescription.trim()}\n` : "",
    "Follow the kitten instructions in order.",
    "Only the final kitten should produce the final answer to the user.",
  ]
    .join("\n")
    .trim();

  const steps = kittens.map((k, idx) => {
    const body = [
      `KITTEN_NAME: ${k.name}`,
      k.instructions ? `\n${k.instructions}\n` : "",
      idx === kittens.length - 1
        ? "FINAL_STEP: Write the final answer to the user."
        : "OUTPUT: Return only what the next kitten needs.",
    ]
      .join("\n")
      .trim();
    return {
      index: idx + 1,
      modelId: k.model_id,
      instructions: body,
    };
  });

  const instructions = serializeRouterInstructions({
    global,
    steps,
  });

  return { modelIds, instructions };
}

export function normalizeCatSlug(input: string): string {
  return normalizeSlug(input);
}

