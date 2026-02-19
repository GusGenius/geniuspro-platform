import type { CatKitten } from "@/components/cats/types";
import { normalizeSlug } from "@/components/cats/cat-slug";

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

export function normalizeCatSlug(input: string): string {
  return normalizeSlug(input);
}

