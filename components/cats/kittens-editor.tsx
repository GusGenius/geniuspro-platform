"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Play, Trash2 } from "lucide-react";

import { uploadCatTestImage, getSignedUrl } from "@/lib/cat-test-image";
import { AVAILABLE_MODELS } from "@/components/models/available-models";
import {
  ensureKittenSuffix,
  stripKittenSuffix,
} from "@/components/cats/cat-compiler";
import type { CatKitten, CatKittenType } from "@/components/cats/types";

type Props = {
  kittens: CatKitten[];
  onChange: (next: CatKitten[]) => void;
  onTestKitten?: (stepIndex: number) => void;
  /** When set, show per-kitten test image override. */
  userId?: string;
  catSlug?: string;
  /** Latest generated overlay URL by step index (1-based). Shown next to test image. */
  latestGeneratedImageByStep?: Record<number, string>;
};

function createKitten(): CatKitten {
  const id = crypto.randomUUID();
  return {
    id,
    name: "Kitten",
    type: "model",
    model_id: AVAILABLE_MODELS[0]?.id ?? "gemini-3-flash",
    instructions: "",
  };
}

export function KittensEditor({
  kittens,
  onChange,
  onTestKitten,
  userId,
  catSlug,
  latestGeneratedImageByStep,
}: Props) {
  const list = kittens.length > 0 ? kittens : [createKitten()];
  const [uploadingKittenId, setUploadingKittenId] = useState<string | null>(null);
  const [kittenImageUrls, setKittenImageUrls] = useState<Record<string, string>>({});
  const canReplacePerKitten = !!userId && !!catSlug;

  useEffect(() => {
    for (const k of list) {
      const path = (k as { test_image_storage_path?: string }).test_image_storage_path?.trim();
      if (!path) continue;
      getSignedUrl(path)
        .then((url) =>
          setKittenImageUrls((prev) => (prev[k.id] === url ? prev : { ...prev, [k.id]: url }))
        )
        .catch(() => {});
    }
  }, [list]);

  function updateKitten(id: string, patch: Partial<CatKitten>) {
    onChange(list.map((k) => (k.id === id ? ({ ...k, ...patch } as CatKitten) : k)));
  }

  function setKittenType(id: string, nextType: CatKittenType) {
    onChange(
      list.map((k) => {
        if (k.id !== id) return k;
        const base = { id: k.id, name: k.name };
        if (nextType === "vision_http") {
          return {
            ...base,
            type: "vision_http",
            path: "",
            image_source: "original",
          } satisfies CatKitten;
        }
        if (nextType === "image_gen") {
          return {
            ...base,
            type: "image_gen",
            image_source: "original",
            model_id: "gemini-nano-banana-pro",
            system_instructions: "",
            instructions: "",
          } satisfies CatKitten;
        }
        if (nextType === "sam3") {
          return {
            ...base,
            type: "sam3",
            image_source: "original",
            targets: [
              { name: "gutter", prompts: ["gutter", "roofline"] },
              { name: "rain_chain", prompts: ["rain chain"] },
              { name: "downspout", prompts: ["downspout"] },
              { name: "tank", prompts: ["water tank", "rainwater tank"] },
            ],
            run_all_targets: true,
            mask_only: true,
          } satisfies CatKitten;
        }
        if (nextType === "gutter_custom_solution") {
          return {
            ...base,
            type: "gutter_custom_solution",
            image_source: "previous_overlay",
            include_masks_base64: true,
            include_overlay_image: true,
          } satisfies CatKitten;
        }
        if (nextType === "transform_js") {
          return {
            ...base,
            type: "transform_js",
            code: [
              "export default async function transform(input, ctx) {",
              "  // input is JSON from the previous step",
              "  // return JSON (object/array) or a string",
              "  return input;",
              "}",
              "",
            ].join("\n"),
          } satisfies CatKitten;
        }
        if (nextType === "transform_py") {
          return {
            ...base,
            type: "transform_py",
            code: [
              "def transform(input, ctx):",
              "    # input is JSON from the previous step",
              "    # return dict/list for JSON, or a string",
              "    return input",
              "",
            ].join("\n"),
          } satisfies CatKitten;
        }
        // Default: model
        return {
          ...base,
          type: "model",
          model_id: AVAILABLE_MODELS[0]?.id ?? "gemini-3-flash",
          instructions: "",
        } satisfies CatKitten;
      })
    );
  }

  function removeKitten(id: string) {
    const next = list.filter((k) => k.id !== id);
    onChange(next.length > 0 ? next : [createKitten()]);
  }

  function moveKitten(from: number, to: number) {
    if (to < 0 || to >= list.length) return;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div className="mt-4 bg-gray-200/60 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Kittens (steps)
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Each kitten is one pipeline step (model call, vision HTTP, or transform).
          The last kitten should produce the final user-facing output.
        </p>
      </div>

      <div className="space-y-4 mt-4">
        {list.map((k, idx) => {
          return (
            <div
              key={k.id}
              className="bg-gray-100/70 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex items-center gap-1 flex-1 min-w-0 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                    <input
                      value={stripKittenSuffix(k.name)}
                      onChange={(e) =>
                        updateKitten(k.id, {
                          name: ensureKittenSuffix(e.target.value),
                        })
                      }
                      placeholder="e.g. Generate Gutter System"
                      className="flex-1 min-w-0 px-3 py-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0 border-0"
                    />
                    <span className="flex-shrink-0 px-2 py-2 text-gray-500 dark:text-gray-400 font-medium">
                      {stripKittenSuffix(k.name) ? " Kitten" : "Kitten"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {onTestKitten ? (
                    <button
                      type="button"
                      onClick={() => onTestKitten(idx + 1)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 font-medium text-xs"
                      title={`Test step ${idx + 1} only`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      Test
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => moveKitten(idx, idx - 1)}
                    disabled={idx === 0}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveKitten(idx, idx + 1)}
                    disabled={idx === list.length - 1}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeKitten(k.id)}
                    disabled={list.length === 1}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={
                    typeof (k as { type?: unknown }).type === "string"
                      ? String((k as { type?: unknown }).type)
                      : "model"
                  }
                  onChange={(e) => setKittenType(k.id, e.target.value as CatKittenType)}
                  className="w-full pl-4 pr-10 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                >
                  <option value="model">Model</option>
                  <option value="vision_http">Vision HTTP</option>
                  <option value="image_gen">Image Gen (Gemini)</option>
                  <option value="sam3">SAM 3 (Replicate)</option>
                  <option value="gutter_custom_solution">Gutter Custom Solution</option>
                  <option value="transform_js">Transform (JS)</option>
                  <option value="transform_py">Transform (Python)</option>
                </select>
              </div>

              {(typeof (k as { type?: unknown }).type !== "string" ||
                (k as { type?: unknown }).type === "model") && (
                <>
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Model
                    </label>
                    <select
                      value={String((k as { model_id?: unknown }).model_id ?? "")}
                      onChange={(e) =>
                        updateKitten(k.id, { model_id: e.target.value } as CatKitten)
                      }
                      className="w-full pl-4 pr-10 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                    >
                      <optgroup label="GeniusPro">
                        {AVAILABLE_MODELS.filter((m) => m.id.startsWith("geniuspro")).map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Gemini">
                        {AVAILABLE_MODELS.filter((m) => m.id.startsWith("gemini")).map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Claude">
                        {AVAILABLE_MODELS.filter((m) => m.id.startsWith("claude")).map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="GPT">
                        {AVAILABLE_MODELS.filter((m) => m.id.startsWith("gpt")).map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Other">
                        {AVAILABLE_MODELS.filter((m) => !m.id.match(/^(geniuspro|gemini|claude|gpt)/)).map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Instructions
                    </label>
                    <textarea
                      value={String((k as { instructions?: unknown }).instructions ?? "")}
                      onChange={(e) =>
                        updateKitten(k.id, { instructions: e.target.value } as CatKitten)
                      }
                      placeholder="What should this kitten do?"
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </>
              )}

              {(k as { type?: unknown }).type === "image_gen" && (
                <div className="mt-3 space-y-3">
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-3">
                      Prompts for Gemini image generation
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                          1. System prompt (optional)
                        </label>
                        <textarea
                          value={String((k as { system_instructions?: unknown }).system_instructions ?? "")}
                          onChange={(e) =>
                            updateKitten(k.id, { system_instructions: e.target.value } as CatKitten)
                          }
                          placeholder="Role, constraints, engineering logic (e.g. Senior Hydrology Engineer, color rules...)"
                          rows={8}
                          className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[180px] font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                          2. User prompt (instructions)
                        </label>
                        <textarea
                          value={String((k as { instructions?: unknown }).instructions ?? "")}
                          onChange={(e) =>
                            updateKitten(k.id, { instructions: e.target.value } as CatKitten)
                          }
                          placeholder="Describe the image to generate (e.g. [ACTION]: Analyze the photo and design a hybrid rainwater system...)"
                          rows={6}
                          className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[150px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                        Image source
                      </label>
                      <select
                        value={
                          String((k as { image_source?: unknown }).image_source ?? "") ===
                          "previous_overlay"
                            ? "previous_overlay"
                            : "original"
                        }
                        onChange={(e) =>
                          updateKitten(k.id, {
                            image_source: e.target.value as "original" | "previous_overlay",
                          } as CatKitten)
                        }
                        className="w-full pl-4 pr-10 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                      >
                        <option value="original">Original image</option>
                        <option value="previous_overlay">Previous step overlay_base64</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                        Model
                      </label>
                      <select
                        value={String((k as { model_id?: unknown }).model_id ?? "gemini-nano-banana-pro")}
                        onChange={(e) =>
                          updateKitten(k.id, { model_id: e.target.value } as CatKitten)
                        }
                        className="w-full pl-4 pr-10 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                      >
                        <option value="gemini-nano-banana">Nano Banana</option>
                        <option value="gemini-nano-banana-pro">Nano Banana Pro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                        Fallback model
                      </label>
                      <select
                        value={String((k as { fallback_model_id?: unknown }).fallback_model_id ?? "")}
                        onChange={(e) =>
                          updateKitten(k.id, {
                            fallback_model_id: e.target.value || undefined,
                          } as CatKitten)
                        }
                        className="w-full pl-4 pr-10 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                      >
                        <option value="">None</option>
                        <option value="gemini-nano-banana">Nano Banana</option>
                        <option value="gemini-nano-banana-pro">Nano Banana Pro</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Calls Gemini directly. Requires GEMINI_API_KEY or GOOGLE_API_KEY.
                    Fallback model is used when primary fails (e.g. 429, 503).
                  </p>
                </div>
              )}

              {(k as { type?: unknown }).type === "sam3" && (
                <div className="mt-3 space-y-3">
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-3">
                      Replicate SAM 3 — text-prompt segmentation. Configure targets (name + prompts).
                    </p>
                    <div className="space-y-3">
                      {(Array.isArray((k as { targets?: unknown } | undefined)?.targets)
                        ? ((k as { targets?: { name: string; prompts: string[] }[] } | undefined)?.targets ?? [])
                        : []
                      ).map((t, ti) => (
                        <div
                          key={ti}
                          className="flex flex-wrap gap-2 items-start p-2 rounded-lg bg-gray-100/60 dark:bg-gray-900/60"
                        >
                          <input
                            value={t.name}
                            onChange={(e) => {
                              const targets = [...((k as { targets?: { name: string; prompts: string[] }[] }).targets ?? [])];
                              targets[ti] = { ...targets[ti]!, name: e.target.value };
                              updateKitten(k.id, { targets } as CatKitten);
                            }}
                            placeholder="Target name (e.g. gutter)"
                            className="flex-1 min-w-[100px] px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm"
                          />
                          <input
                            value={t.prompts.join(", ")}
                            onChange={(e) => {
                              const prompts = e.target.value
                                .split(/[,\n]/)
                                .map((p) => p.trim())
                                .filter((p) => p.length > 0);
                              const targets = [...((k as { targets?: { name: string; prompts: string[] }[] }).targets ?? [])];
                              targets[ti] = { ...targets[ti]!, prompts: prompts.length > 0 ? prompts : [""] };
                              updateKitten(k.id, { targets } as CatKitten);
                            }}
                            placeholder="Prompts (comma-separated, e.g. gutter, roofline)"
                            className="flex-[2] min-w-[180px] px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const targets = ((k as { targets?: { name: string; prompts: string[] }[] }).targets ?? []).filter(
                                (_, i) => i !== ti
                              );
                              updateKitten(k.id, { targets: targets.length > 0 ? targets : [{ name: "", prompts: [""] }] } as CatKitten);
                            }}
                            className="p-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const targets = [...((k as { targets?: { name: string; prompts: string[] }[] }).targets ?? []), { name: "", prompts: [""] }];
                          updateKitten(k.id, { targets } as CatKitten);
                        }}
                        className="text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
                      >
                        + Add target
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                        Image source
                      </label>
                      <select
                        value={
                          String((k as { image_source?: unknown }).image_source ?? "") ===
                          "previous_overlay"
                            ? "previous_overlay"
                            : "original"
                        }
                        onChange={(e) =>
                          updateKitten(k.id, {
                            image_source: e.target.value as "original" | "previous_overlay",
                          } as CatKitten)
                        }
                        className="w-full pl-4 pr-10 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                      >
                        <option value="original">Original image</option>
                        <option value="previous_overlay">Previous step overlay_base64</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        checked={(k as { run_all_targets?: unknown }).run_all_targets === true}
                        onChange={(e) =>
                          updateKitten(k.id, { run_all_targets: e.target.checked } as CatKitten)
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        Run all targets (don&apos;t stop after first success)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        checked={(k as { mask_only?: unknown }).mask_only === true}
                        onChange={(e) =>
                          updateKitten(k.id, { mask_only: e.target.checked } as CatKitten)
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        Mask only (single mask per run)
                      </span>
                    </label>
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Calls Replicate SAM 3 directly. Requires REPLICATE_API_TOKEN.
                  </p>
                </div>
              )}

              {(k as { type?: unknown }).type === "gutter_custom_solution" && (
                <div className="mt-3 space-y-3">
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                      End-to-end gutter placement JSON (SAM 3 + heuristics). Designed to match the old
                      `/gutter/segment-overlay` output schema.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                        Image source
                      </label>
                      <select
                        value={
                          String((k as { image_source?: unknown }).image_source ?? "") === "original"
                            ? "original"
                            : "previous_overlay"
                        }
                        onChange={(e) =>
                          updateKitten(k.id, {
                            image_source: e.target.value as "original" | "previous_overlay",
                          } as CatKitten)
                        }
                        className="w-full pl-4 pr-10 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                      >
                        <option value="previous_overlay">Previous step overlay_base64</option>
                        <option value="original">Original image</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        checked={(k as { include_masks_base64?: unknown }).include_masks_base64 !== false}
                        onChange={(e) =>
                          updateKitten(k.id, { include_masks_base64: e.target.checked } as CatKitten)
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        Include masks base64
                      </span>
                    </label>

                    <label className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        checked={(k as { include_overlay_image?: unknown }).include_overlay_image !== false}
                        onChange={(e) =>
                          updateKitten(k.id, { include_overlay_image: e.target.checked } as CatKitten)
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        Include overlay image base64
                      </span>
                    </label>

                    <label className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        checked={(k as { use_gemini_overlay?: unknown }).use_gemini_overlay !== false}
                        onChange={(e) =>
                          updateKitten(k.id, { use_gemini_overlay: e.target.checked } as CatKitten)
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        Gemini designs system first (old server flow)
                      </span>
                    </label>
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    When &quot;Gemini designs system first&quot; is on: Gemini creates the overlay (cyan gutters, yellow rain chains, etc.); SAM 3 segments it. Requires GEMINI_API_KEY and REPLICATE_API_TOKEN.
                  </p>
                </div>
              )}

              {(k as { type?: unknown }).type === "vision_http" && (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Vision path
                    </label>
                    <input
                      value={String((k as { path?: unknown }).path ?? "")}
                      onChange={(e) => updateKitten(k.id, { path: e.target.value } as CatKitten)}
                      placeholder="/your/vision/path"
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Image source
                    </label>
                    <select
                      value={
                        String((k as { image_source?: unknown }).image_source ?? "original") ===
                        "previous_overlay"
                          ? "previous_overlay"
                          : "original"
                      }
                      onChange={(e) =>
                        updateKitten(k.id, { image_source: e.target.value } as CatKitten)
                      }
                      className="w-full pl-4 pr-10 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                    >
                      <option value="original">Original image</option>
                      <option value="previous_overlay">Previous step overlay_base64</option>
                    </select>
                  </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                        Model override (optional)
                      </label>
                      <input
                        value={String((k as { model_id?: unknown }).model_id ?? "")}
                        onChange={(e) =>
                          updateKitten(k.id, { model_id: e.target.value } as CatKitten)
                        }
                        placeholder="e.g. gemini-nano-banana-pro"
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      />
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        Only works if the vision endpoint supports model overrides.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                        Instructions (optional)
                      </label>
                      <textarea
                        value={String((k as { instructions?: unknown }).instructions ?? "")}
                        onChange={(e) =>
                          updateKitten(k.id, { instructions: e.target.value } as CatKitten)
                        }
                        placeholder="Extra instructions to send to the vision endpoint"
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {((k as { type?: unknown }).type === "transform_js" ||
                (k as { type?: unknown }).type === "transform_py") && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Code
                  </label>
                  <textarea
                    value={String((k as { code?: unknown }).code ?? "")}
                    onChange={(e) => updateKitten(k.id, { code: e.target.value } as CatKitten)}
                    rows={10}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-xs"
                  />
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    JS: export default function or export const transform. Python: define
                    transform(input, ctx).
                  </p>
                </div>
              )}

              {canReplacePerKitten && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Test image (override)
                  </label>
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          className="block w-full max-w-[200px] text-xs text-gray-600 dark:text-gray-300 file:mr-2 file:px-3 file:py-2 file:rounded-lg file:border file:border-gray-200 dark:file:border-gray-700 file:bg-gray-100 dark:file:bg-gray-900 file:text-gray-700 dark:file:text-gray-200"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file || !userId || !catSlug) return;
                            setUploadingKittenId(k.id);
                            try {
                              const { storagePath, signedUrl } = await uploadCatTestImage({
                                userId,
                                catSlug,
                                file,
                                kittenId: k.id,
                              });
                              updateKitten(k.id, { test_image_storage_path: storagePath } as CatKitten);
                              setKittenImageUrls((prev) => ({ ...prev, [k.id]: signedUrl }));
                            } finally {
                              setUploadingKittenId(null);
                            }
                          }}
                        />
                        {(k as { test_image_storage_path?: string }).test_image_storage_path ? (
                          <span className="text-xs text-green-600 dark:text-green-400 flex-shrink-0">
                            {uploadingKittenId === k.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin inline" />
                            ) : (
                              "Saved"
                            )}
                          </span>
                        ) : uploadingKittenId === k.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
                        ) : null}
                      </div>
                      {kittenImageUrls[k.id] ? (
                        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100/60 dark:bg-gray-900/60 max-w-[240px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={kittenImageUrls[k.id]}
                            alt="Kitten test image"
                            className="w-full max-h-32 object-contain"
                          />
                        </div>
                      ) : (k as { test_image_storage_path?: string }).test_image_storage_path &&
                        uploadingKittenId !== k.id ? (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 max-w-[240px]">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Loading image...
                        </div>
                      ) : null}
                    </div>
                    {latestGeneratedImageByStep?.[idx + 1] ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                          Latest generated (Step {idx + 1})
                        </span>
                        <a
                          href={latestGeneratedImageByStep[idx + 1]}
                          target="_blank"
                          rel="noreferrer"
                          className="block overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100/60 dark:bg-gray-900/60 max-w-[240px] hover:opacity-90 transition-opacity"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={latestGeneratedImageByStep[idx + 1]}
                            alt={`Latest generated overlay Step ${idx + 1}`}
                            className="w-full max-h-32 object-contain"
                          />
                        </a>
                      </div>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Replace this kitten&apos;s test image. Used when running Step {idx + 1}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

