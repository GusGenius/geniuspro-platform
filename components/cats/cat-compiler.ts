import type { CatKitten } from "@/components/cats/types";
import { normalizeSlug } from "@/components/cats/cat-slug";

export const KITTEN_SUFFIX = " Kitten";

/** Returns the descriptor part (editable); full name = descriptor + " Kitten" or "Kitten" if empty. */
export function stripKittenSuffix(name: string): string {
  const trimmed = name.trim();
  if (!trimmed || trimmed === "Kitten") return "";
  if (trimmed.endsWith(KITTEN_SUFFIX)) {
    return trimmed.slice(0, -KITTEN_SUFFIX.length).trim();
  }
  return trimmed;
}

export function ensureKittenSuffix(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "Kitten";
  if (trimmed === "Kitten" || trimmed.endsWith(KITTEN_SUFFIX)) return trimmed;
  return trimmed + KITTEN_SUFFIX;
}

export function normalizeKittens(input: CatKitten[]): CatKitten[] {
  const list = Array.isArray(input) ? input : [];
  return list
    .map((k, idx) => {
      const id =
        typeof k?.id === "string" && k.id.trim()
          ? k.id.trim()
          : `kitten-${idx + 1}-${Math.random().toString(16).slice(2, 8)}`;
      const name = ensureKittenSuffix(String(k?.name ?? "").trim() || "Kitten");
      const type =
        typeof (k as { type?: unknown })?.type === "string"
          ? String((k as { type?: unknown }).type)
          : undefined;

      if (type === "vision_http") {
        return {
          id,
          name,
          type: "vision_http" as const,
          path: String((k as { path?: unknown }).path ?? "").trim(),
          image_source:
            String((k as { image_source?: unknown }).image_source ?? "").trim() ===
            "previous_overlay"
              ? ("previous_overlay" as const)
              : ("original" as const),
          model_id: String((k as { model_id?: unknown }).model_id ?? "").trim() || undefined,
          instructions: String((k as { instructions?: unknown }).instructions ?? "").trim() || undefined,
        };
      }

      if (type === "transform_js") {
        return {
          id,
          name,
          type: "transform_js" as const,
          code: String((k as { code?: unknown }).code ?? ""),
        };
      }

      if (type === "transform_py") {
        return {
          id,
          name,
          type: "transform_py" as const,
          code: String((k as { code?: unknown }).code ?? ""),
        };
      }

      // Default: legacy or explicit model kitten.
      return {
        id,
        name,
        type: "model" as const,
        model_id: String((k as { model_id?: unknown }).model_id ?? "").trim() || "gemini-3-flash",
        instructions: String((k as { instructions?: unknown }).instructions ?? "").trim(),
      };
    });
}

export function normalizeCatSlug(input: string): string {
  return normalizeSlug(input);
}

