"use client";

import { useMemo } from "react";

export type Sam3Target = {
  name: string;
  prompts: string[];
};

export type Sam3RouterStepsConfig = {
  enabled: boolean;
  includeRaw: boolean;
  targets: Sam3Target[];
  blocksJson: string;
};

type Props = {
  value: Sam3RouterStepsConfig;
  onChange: (next: Sam3RouterStepsConfig) => void;
};

const DEFAULT_BLOCKS_JSON = JSON.stringify(
  [{ id: "dedupe_lines" }, { id: "filter_short_lines", min_span: 0.12 }],
  null,
  2
);

export function RouterSam3Config({ value, onChange }: Props) {
  const hasTargets = value.targets.some(
    (t) => t.name.trim() && t.prompts.some((p) => p.trim())
  );

  const parsedBlocksError = useMemo(() => {
    const raw = value.blocksJson.trim();
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return "Blocks must be a JSON array.";
      if (!parsed.every((b) => typeof b === "object" && b !== null)) {
        return "Each block must be a JSON object.";
      }
      return null;
    } catch {
      return "Blocks JSON is invalid.";
    }
  }, [value.blocksJson]);

  function updateTarget(index: number, next: Sam3Target) {
    const targets = [...value.targets];
    targets[index] = next;
    onChange({ ...value, targets });
  }

  function addTarget() {
    onChange({
      ...value,
      targets: [...value.targets, { name: "", prompts: [""] }],
    });
  }

  function removeTarget(index: number) {
    onChange({
      ...value,
      targets: value.targets.filter((_, i) => i !== index),
    });
  }

  function useStarterTemplate() {
    onChange({
      enabled: true,
      includeRaw: false,
      targets: [
        { name: "rooflines", prompts: ["roof edge", "gutter line", "eaves"] },
        { name: "ground", prompts: ["ground", "grass", "lawn"] },
      ],
      blocksJson: DEFAULT_BLOCKS_JSON,
    });
  }

  return (
    <div className="mt-4 bg-gray-200/60 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            SAM 3 (Vision) settings
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Configure what SAM 3 should look for using targets + prompt packs.
            The router will run SAM 3 first and inject the JSON into your chat
            models.
          </p>
        </div>
        <button
          type="button"
          onClick={useStarterTemplate}
          className="text-xs font-medium px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
        >
          Use starter template
        </button>
      </div>

      <>
        <label className="mt-4 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.includeRaw}
              onChange={(e) => onChange({ ...value, includeRaw: e.target.checked })}
              className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">
              Include raw output (masks/boxes/scores). Larger payload.
            </span>
          </label>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Targets (prompt packs)
              </label>
              <button
                type="button"
                onClick={addTarget}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
              >
                Add target
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Each target has a name and a list of text prompts. SAM 3 will try
              prompts until it finds detections.
            </p>

            <div className="space-y-3 mt-3">
              {value.targets.map((t, idx) => (
                <div
                  key={`${idx}-${t.name}`}
                  className="bg-gray-100/70 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Target name
                      </label>
                      <input
                        value={t.name}
                        onChange={(e) =>
                          updateTarget(idx, { ...t, name: e.target.value })
                        }
                        placeholder="e.g. rooflines"
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mt-3 mb-1">
                        Prompts (one per line)
                      </label>
                      <textarea
                        value={(t.prompts ?? []).join("\n")}
                        onChange={(e) =>
                          updateTarget(idx, {
                            ...t,
                            prompts: e.target.value.split("\n").map((p) => p.trim()).filter(Boolean),
                          })
                        }
                        placeholder={"roof edge\ngutter line\neaves"}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeTarget(idx)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                      title="Remove target"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!hasTargets ? (
              <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                Add at least one target with at least one prompt.
              </p>
            ) : null}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Post-processing blocks (JSON)
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Allowlisted blocks applied after SAM 3. Example:{" "}
              <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">
                dedupe_lines
              </code>
              ,{" "}
              <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">
                filter_short_lines
              </code>
              .
            </p>
            <textarea
              value={value.blocksJson}
              onChange={(e) => onChange({ ...value, blocksJson: e.target.value })}
              rows={6}
              className="mt-2 w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-xs"
            />
            {parsedBlocksError ? (
              <p className="mt-2 text-xs text-red-600 dark:text-red-300">
                {parsedBlocksError}
              </p>
            ) : null}
          </div>
        </>
    </div>
  );
}

