"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import { AlertTriangle, ArrowLeft, Loader2, Plus } from "lucide-react";
import { normalizeSlug, slugFromName } from "@/components/routers/router-form-utils";
import { saveRouterToSupabase } from "@/components/routers/router-save";

interface UserCatRow {
  id: string;
  name: string;
  description: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export default function NewCatPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(() => {
    return name.trim().length > 0 && normalizeSlug(slug).length > 0 && !saving;
  }, [name, slug, saving]);

  const handleCreate = async () => {
    if (!user) return;
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const normalizedSlug = normalizeSlug(slug || slugFromName(trimmedName));
    if (!normalizedSlug) {
      setError("Slug is required (e.g. research-writer)");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("user_cats")
        .insert({
          user_id: user.id,
          name: trimmedName,
          description: description.trim(),
          slug: normalizedSlug,
        })
        .select("id, name, description, slug, created_at, updated_at")
        .single();

      if (insertError || !data) {
        setError(insertError?.message || "Failed to create cat");
        return;
      }

      const row = data as UserCatRow;
      const compiledInstructions = [
        `You are Cat '${row.name}'.`,
        row.description ? `\n${row.description}\n` : "",
        "Be helpful, correct, and concise.",
      ]
        .join("\n")
        .trim();

      const savedRouter = await saveRouterToSupabase({
        supabase,
        user,
        payloadBase: {
          user_id: user.id,
          slug: row.slug,
          name: row.name,
          instructions: compiledInstructions,
          model_id: "gemini-3-flash",
          fallback_model_id: null,
          updated_at: new Date().toISOString(),
        },
        modelIds: ["gemini-3-flash"],
        routingMode: "pipeline",
        routerSteps: null,
      });
      if (!savedRouter.ok) {
        // Keep storage consistent: if runtime compilation failed, remove the cat record.
        await supabase.from("user_cats").delete().eq("id", row.id).eq("user_id", user.id);
        const msg =
          savedRouter.error instanceof Error
            ? savedRouter.error.message
            : String(savedRouter.error ?? "Failed to compile cat runtime");
        setError(msg);
        return;
      }

      router.push(`/cats/${row.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create cat";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <Link
                href="/cats"
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white truncate">
                  Create Cat
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Save a cat config you can reuse across the platform and API
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 sm:p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  const next = e.target.value;
                  setName(next);
                  // Keep slug feeling effortless: only auto-fill when user hasn't touched it.
                  if (!slug.trim()) {
                    setSlug(slugFromName(next));
                  }
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="e.g., Research + Writer"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                API Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g., research-writer"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Call via <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">model=cat:{normalizeSlug(slug || slugFromName(name)) || "your-slug"}</code>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What should this cat do?"
                rows={4}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/cats"
                className="px-4 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
              >
                Cancel
              </Link>
              <button
                onClick={() => handleCreate().catch(() => {})}
                disabled={!canSave}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

