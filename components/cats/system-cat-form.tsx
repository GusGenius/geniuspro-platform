"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, Loader2, Save } from "lucide-react";

import { supabase } from "@/lib/supabase/client";

import type { CatKitten } from "@/components/cats/types";
import { normalizeKittens } from "@/components/cats/cat-compiler";
import { KittensEditor } from "@/components/cats/kittens-editor";

type Props = {
  slug: string;
  initial: { name: string; description: string; kittens: CatKitten[] };
  backHref: string;
  backLabel: string;
};

export function SystemCatForm({ slug, initial, backHref, backLabel }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [kittens, setKittens] = useState<CatKitten[]>(
    initial.kittens.length > 0 ? normalizeKittens(initial.kittens) : []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(() => {
    if (saving) return false;
    if (!name.trim()) return false;
    return normalizeKittens(kittens).length > 0;
  }, [saving, name, kittens]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    const kittensFinal = normalizeKittens(kittens);
    if (!trimmedName) return;
    if (kittensFinal.length === 0) {
      setError("Add at least one kitten.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from("system_cats")
        .update({
          name: trimmedName,
          description: description.trim(),
          kittens: kittensFinal,
          updated_at: new Date().toISOString(),
        })
        .eq("slug", slug);

      if (updateError) throw updateError;
      router.push(backHref);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Edit {slug}
          </h1>
          <code className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-900 px-2 py-0.5 rounded font-mono mt-2 inline-block">
            {slug}
          </code>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name"
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00b8a9] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this model do?"
              rows={2}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00b8a9] focus:border-transparent resize-none"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Kittens (models)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Each kitten is a model. Order matters: first model is tried, then fallback to next.
            </p>
            <KittensEditor kittens={kittens} onChange={setKittens} />
          </div>

          <button
            onClick={() => handleSave().catch(() => {})}
            disabled={!canSave}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#00b8a9] hover:bg-[#00a89a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
