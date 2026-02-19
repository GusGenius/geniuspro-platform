"use client";

import { useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";

import { generateCatFromDescription } from "@/components/cats/cat-ai";
import type { CatKitten } from "@/components/cats/types";

type GeneratedCat = {
  name: string;
  description: string;
  kittens: Array<Omit<CatKitten, "id">>;
};

type Props = {
  open: boolean;
  onClose: () => void;
  accessToken: string | null;
  onApply: (gen: GeneratedCat) => void;
};

export function AiWizardModal({ open, onClose, accessToken, onApply }: Props) {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleGenerate = async () => {
    if (!accessToken) {
      setError("You must be logged in to generate a cat.");
      return;
    }
    if (!prompt.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const gen = await generateCatFromDescription({
        accessToken,
        userPrompt: prompt,
      });
      onApply({
        name: gen.name,
        description: gen.description,
        kittens: gen.kittens,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
        aria-label="Close AI wizard"
      />
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl">
        <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              AI Wizard
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Describe what you want and we will generate kittens you can edit.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Take a home photo, generate a gutter overlay, then return placement JSON."
            rows={5}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />

          {error ? (
            <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            disabled={generating}
            className="px-4 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleGenerate().catch(() => {})}
            disabled={generating || !prompt.trim()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

