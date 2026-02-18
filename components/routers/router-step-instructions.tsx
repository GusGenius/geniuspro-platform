"use client";

import { getModelLabel } from "@/components/routers/available-models";
import { normalizeModelIds } from "@/components/routers/router-form-utils";

type Props = {
  visible: boolean;
  modelIds: string[];
  instructionsByModelId: Record<string, string>;
  onChangeInstruction: (modelId: string, next: string) => void;
  onUseTemplate: () => void;
};

export function RouterStepInstructions({
  visible,
  modelIds,
  instructionsByModelId,
  onChangeInstruction,
  onUseTemplate,
}: Props) {
  if (!visible) return null;

  return (
    <div className="mt-4 bg-gray-200/60 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Step instructions (optional)
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Each step runs as a separate model call. Use this to give different
            directions per model (analysis -> rewrite -> final answer).
          </p>
        </div>
        <button
          type="button"
          onClick={onUseTemplate}
          className="text-xs font-medium px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
        >
          Use template
        </button>
      </div>

      <div className="space-y-3 mt-4">
        {normalizeModelIds(modelIds).map((modelId, idx) => {
          const key = modelId.trim().toLowerCase();
          return (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                Step {idx + 1} — {getModelLabel(modelId)}
              </label>
              <textarea
                value={instructionsByModelId[key] ?? ""}
                onChange={(e) => onChangeInstruction(modelId, e.target.value)}
                placeholder="What should this model do in the pipeline?"
                rows={3}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

