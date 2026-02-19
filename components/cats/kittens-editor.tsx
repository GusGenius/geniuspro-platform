"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

import { AVAILABLE_MODELS } from "@/components/models/available-models";
import type { CatKitten } from "@/components/cats/types";

type Props = {
  kittens: CatKitten[];
  onChange: (next: CatKitten[]) => void;
  maxKittens?: number;
};

function createKitten(): CatKitten {
  const id = crypto.randomUUID();
  return {
    id,
    name: "Kitten",
    model_id: AVAILABLE_MODELS[0]?.id ?? "gemini-3-flash",
    instructions: "",
  };
}

export function KittensEditor({ kittens, onChange, maxKittens = 8 }: Props) {
  const list = kittens.length > 0 ? kittens : [createKitten()];

  function updateKitten(id: string, patch: Partial<CatKitten>) {
    onChange(list.map((k) => (k.id === id ? { ...k, ...patch } : k)));
  }

  function addKitten() {
    if (list.length >= maxKittens) return;
    onChange([...list, createKitten()]);
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Kittens (steps)
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Each kitten runs as one model call in order. The last kitten should
            produce the final user-facing output.
          </p>
        </div>
        <button
          type="button"
          onClick={addKitten}
          disabled={list.length >= maxKittens}
          className="text-xs font-medium px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          Add kitten
        </button>
      </div>

      <div className="space-y-4 mt-4">
        {list.map((k, idx) => {
          return (
            <div
              key={k.id}
              className="bg-gray-100/70 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <input
                    value={k.name}
                    onChange={(e) => updateKitten(k.id, { name: e.target.value })}
                    placeholder="Kitten name (e.g. Researcher)"
                    className="flex-1 min-w-0 px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
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
                  Model
                </label>
                <select
                  value={k.model_id}
                  onChange={(e) => updateKitten(k.id, { model_id: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {AVAILABLE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Instructions
                </label>
                <textarea
                  value={k.instructions}
                  onChange={(e) =>
                    updateKitten(k.id, { instructions: e.target.value })
                  }
                  placeholder="What should this kitten do?"
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

