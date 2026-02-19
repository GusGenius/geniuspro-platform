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

      const testImagePath = String((k as { test_image_storage_path?: unknown }).test_image_storage_path ?? "").trim() || undefined;

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
          test_image_storage_path: testImagePath,
        };
      }

      if (type === "image_gen") {
        return {
          id,
          name,
          type: "image_gen" as const,
          image_source:
            String((k as { image_source?: unknown }).image_source ?? "").trim() ===
            "previous_overlay"
              ? ("previous_overlay" as const)
              : ("original" as const),
          model_id: String((k as { model_id?: unknown }).model_id ?? "").trim() || "gemini-nano-banana-pro",
          fallback_model_id: String((k as { fallback_model_id?: unknown }).fallback_model_id ?? "").trim() || undefined,
          system_instructions: String((k as { system_instructions?: unknown }).system_instructions ?? "").trim() || undefined,
          instructions: String((k as { instructions?: unknown }).instructions ?? "").trim(),
          test_image_storage_path: testImagePath,
        };
      }

      if (type === "sam3") {
        const targetsRaw: unknown[] = Array.isArray((k as { targets?: unknown }).targets)
          ? ((k as { targets?: unknown[] }).targets ?? [])
          : [];
        const targets = targetsRaw
          .map((t) => {
            if (typeof t !== "object" || t === null) return null;
            const name = String((t as { name?: unknown }).name ?? "").trim();
            const promptsRaw = Array.isArray((t as { prompts?: unknown }).prompts)
              ? (t as { prompts?: unknown[] }).prompts
              : [];
            const prompts = promptsRaw
              .map((p) => String(p ?? "").trim())
              .filter((p) => p.length > 0);
            if (!name || prompts.length === 0) return null;
            return { name, prompts };
          })
          .filter((t): t is { name: string; prompts: string[] } => t !== null);
        const defaultTargets =
          targets.length === 0
            ? [
                { name: "gutter", prompts: ["gutter", "roofline"] },
                { name: "rain_chain", prompts: ["rain chain"] },
                { name: "downspout", prompts: ["downspout"] },
                { name: "tank", prompts: ["water tank", "rainwater tank"] },
              ]
            : targets;
        return {
          id,
          name,
          type: "sam3" as const,
          image_source:
            String((k as { image_source?: unknown }).image_source ?? "").trim() ===
            "previous_overlay"
              ? ("previous_overlay" as const)
              : ("original" as const),
          targets: defaultTargets,
          run_all_targets: (k as { run_all_targets?: unknown }).run_all_targets === true,
          mask_only: (k as { mask_only?: unknown }).mask_only === true,
          test_image_storage_path: testImagePath,
        };
      }

      if (type === "transform_js") {
        return {
          id,
          name,
          type: "transform_js" as const,
          code: String((k as { code?: unknown }).code ?? ""),
          test_image_storage_path: testImagePath,
        };
      }

      if (type === "transform_py") {
        return {
          id,
          name,
          type: "transform_py" as const,
          code: String((k as { code?: unknown }).code ?? ""),
          test_image_storage_path: testImagePath,
        };
      }

      // Default: legacy or explicit model kitten.
      return {
        id,
        name,
        type: "model" as const,
        model_id: String((k as { model_id?: unknown }).model_id ?? "").trim() || "gemini-3-flash",
        instructions: String((k as { instructions?: unknown }).instructions ?? "").trim(),
        test_image_storage_path: testImagePath,
      };
    });
}

export function normalizeCatSlug(input: string): string {
  return normalizeSlug(input);
}

