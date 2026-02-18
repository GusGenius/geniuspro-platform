"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

type ModelOption = { id: string; label: string };

type Props = {
  label: string;
  hint?: string;
  modelIds: string[];
  options: ModelOption[];
  maxModels?: number;
  onChange: (next: string[]) => void;
};

function normalizeModelIds(input: Array<string | null | undefined>): string[] {
  const out: string[] = [];
  for (const v of input) {
    if (typeof v !== "string") continue;
    const trimmed = v.trim();
    if (!trimmed) continue;
    if (!out.includes(trimmed)) out.push(trimmed);
  }
  return out;
}

function getDefaultNewModel(options: ModelOption[], exclude: string[]): string {
  const used = new Set(exclude);
  const candidate = options.find((m) => !used.has(m.id))?.id;
  return candidate ?? options[0]?.id ?? "gemini-3-flash";
}

export function ModelsOrderEditor({
  label,
  hint,
  modelIds,
  options,
  maxModels = 5,
  onChange,
}: Props) {
  const ids = modelIds.length > 0 ? modelIds : [getDefaultNewModel(options, [])];

  function updateModelAt(index: number, nextId: string) {
    const next = [...ids];
    next[index] = nextId;
    onChange(normalizeModelIds(next));
  }

  function addModel() {
    if (ids.length >= maxModels) return;
    onChange([...ids, getDefaultNewModel(options, ids)]);
  }

  function removeModel(index: number) {
    const next = ids.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : [getDefaultNewModel(options, [])]);
  }

  function moveModel(from: number, to: number) {
    if (to < 0 || to >= ids.length) return;
    const next = [...ids];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
        {label}{" "}
        {hint ? <span className="text-gray-400">({hint})</span> : null}
      </label>

      <div className="space-y-2">
        {ids.map((id, idx) => {
          const usedElsewhere = new Set(ids.filter((_, i) => i !== idx));
          return (
            <div key={`${idx}-${id}`} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </div>

              <select
                value={id}
                onChange={(e) => updateModelAt(idx, e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {options.map((m) => (
                  <option
                    key={m.id}
                    value={m.id}
                    disabled={usedElsewhere.has(m.id)}
                  >
                    {m.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => moveModel(idx, idx - 1)}
                disabled={idx === 0}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Move up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveModel(idx, idx + 1)}
                disabled={idx === ids.length - 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Move down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => removeModel(idx)}
                disabled={ids.length === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            The API tries model 1 first, then falls back if it errors.
          </p>
          <button
            type="button"
            onClick={addModel}
            disabled={ids.length >= maxModels}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add model
          </button>
        </div>
      </div>
    </div>
  );
}

