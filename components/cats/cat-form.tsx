"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  Sparkles,
  Save,
  Trash2,
} from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import { slugFromName } from "@/components/cats/cat-slug";

import { CAT_TEMPLATES, getCatTemplate } from "@/components/cats/cat-templates";
import type { CatKitten, CatRow } from "@/components/cats/types";
import {
  normalizeCatSlug,
  normalizeKittens,
} from "@/components/cats/cat-compiler";
import { KittensEditor } from "@/components/cats/kittens-editor";
import { AiWizardModal } from "@/components/cats/ai-wizard-modal";
import { TestRunPanel } from "@/components/cats/test-run-panel";
import { CatPublishPanel } from "@/components/cats/cat-publish-panel";

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  initial?: Partial<CatRow>;
  editingId?: string;
  backHref: string;
  backLabel: string;
  showTestRun?: boolean;
};

function createDefaultKitten(): CatKitten {
  return {
    id: crypto.randomUUID(),
    name: "Helper",
    model_id: "gemini-3-flash",
    instructions: "Be helpful, correct, and concise.",
  };
}

export function CatForm({
  mode,
  initial,
  editingId,
  backHref,
  backLabel,
}: Props) {
  const { user, session } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [kittens, setKittens] = useState<CatKitten[]>(
    Array.isArray(initial?.kittens) && initial!.kittens!.length > 0
      ? normalizeKittens(initial!.kittens as CatKitten[])
      : [createDefaultKitten()]
  );

  const [templateId, setTemplateId] = useState<string>("research-write");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiWizardOpen, setAiWizardOpen] = useState(false);
  const [copiedModelId, setCopiedModelId] = useState(false);
  const [lastFullRunOk, setLastFullRunOk] = useState(false);

  const normalizedSlug = useMemo(() => {
    return normalizeCatSlug(slug || slugFromName(name));
  }, [slug, name]);

  const canSave = useMemo(() => {
    if (!user) return false;
    if (saving) return false;
    if (!name.trim()) return false;
    if (!normalizedSlug) return false;
    return normalizeKittens(kittens).length > 0;
  }, [user, saving, name, normalizedSlug, kittens]);

  const apiModelId = useMemo(() => {
    return normalizedSlug ? `cat:${normalizedSlug}` : "";
  }, [normalizedSlug]);

  const handleCopyModelId = async () => {
    if (!apiModelId) return;
    try {
      await navigator.clipboard.writeText(apiModelId);
      setCopiedModelId(true);
      window.setTimeout(() => setCopiedModelId(false), 1200);
    } catch {
      // Best-effort; ignore clipboard failures (some environments block it).
    }
  };

  const applyTemplate = () => {
    const tpl = getCatTemplate(templateId);
    if (!tpl) return;
    setName((prev) => (prev.trim() ? prev : tpl.defaultName));
    setDescription((prev) => (prev.trim() ? prev : tpl.defaultDescription));
    setKittens(
      tpl.kittens.map((k) => ({
        id: crypto.randomUUID(),
        ...k,
      }))
    );
    if (!slug.trim()) setSlug(slugFromName(tpl.defaultName));
  };

  const handleSave = async () => {
    if (!user) return;
    const trimmedName = name.trim();
    const slugFinal = normalizedSlug;
    const kittensFinal = normalizeKittens(kittens);
    if (!trimmedName) return;
    if (!slugFinal) {
      setError("Slug is required.");
      return;
    }
    if (kittensFinal.length === 0) {
      setError("Add at least one kitten.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // Upsert cat record (source of truth + runtime).
      const now = new Date().toISOString();
      const catPayload = {
        user_id: user.id,
        name: trimmedName,
        description: description.trim(),
        slug: slugFinal,
        kittens: kittensFinal,
        updated_at: now,
      };

      let savedCat: { id: string } | null = null;
      if (mode === "edit" && editingId) {
        const res = await supabase
          .from("user_cats")
          .update(catPayload)
          .eq("id", editingId)
          .eq("user_id", user.id)
          .select("id")
          .single();
        if (res.error || !res.data) throw res.error ?? new Error("Save failed");
        savedCat = res.data as { id: string };
      } else {
        const res = await supabase
          .from("user_cats")
          .insert({ ...catPayload, created_at: now })
          .select("id")
          .single();
        if (res.error || !res.data) throw res.error ?? new Error("Save failed");
        savedCat = res.data as { id: string };
      }

      if (mode === "create") {
        router.push(`/cats/${savedCat.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (mode !== "edit" || !editingId) return;
    const ok = confirm("Delete this cat?");
    if (!ok) return;

    setSaving(true);
    setError(null);
    try {
      const res = await supabase
        .from("user_cats")
        .delete()
        .eq("id", editingId)
        .eq("user_id", user.id);
      if (res.error) throw res.error;

      router.push("/cats");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {mode === "create" ? "Create Cat" : "Edit Cat"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Cats are coordinator workflows. Kittens are the ordered worker steps.
          </p>
        </div>

        {mode === "edit" ? (
          <div className="flex items-center justify-end mb-4">
            <button
              type="button"
              onClick={() => handleDelete().catch(() => {})}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/15 border border-red-500/30 text-red-500 dark:text-red-400 font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Delete Cat
            </button>
          </div>
        ) : null}

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
            {mode === "create" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Start from a template
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <select
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value)}
                      className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {CAT_TEMPLATES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={applyTemplate}
                      className="px-4 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {getCatTemplate(templateId)?.description ??
                      "Pick a template to get started fast."}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    AI (optional)
                  </label>
                  <div className="flex items-center justify-between gap-3 bg-white/60 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Use the AI Wizard to generate kittens, then edit them.
                    </p>
                    <button
                      type="button"
                      onClick={() => setAiWizardOpen(true)}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="w-4 h-4" />
                      AI Wizard
                    </button>
                  </div>
                </div>
              </>
            ) : null}

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => {
                  const next = e.target.value;
                  setName(next);
                  if (!slug.trim()) setSlug(slugFromName(next));
                }}
                placeholder="e.g., Research + Writer"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Cat ID (slug)
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g., research-writer"
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    void handleCopyModelId();
                  }}
                  disabled={!apiModelId}
                  className="inline-flex items-center justify-center gap-2 px-3 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Copy API model ID"
                >
                  {copiedModelId ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                API model id:{" "}
                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">
                  {apiModelId || "cat:your-slug"}
                </code>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="What does this cat do?"
              />
            </div>

            <KittensEditor kittens={kittens} onChange={setKittens} />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push(backHref)}
                className="px-4 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSave().catch(() => {})}
                disabled={!canSave}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {mode === "edit" && normalizedSlug ? (
          <>
            <TestRunPanel
              catSlug={normalizedSlug}
              accessToken={session?.access_token ?? null}
              kittens={normalizeKittens(kittens)}
              onFullRunResult={({ ok }) => setLastFullRunOk(ok)}
            />
            {editingId ? (
              <CatPublishPanel
                catId={editingId}
                catSlug={normalizedSlug}
                canPublish={lastFullRunOk}
              />
            ) : null}
          </>
        ) : null}
      </div>

      <AiWizardModal
        open={aiWizardOpen}
        onClose={() => setAiWizardOpen(false)}
        accessToken={session?.access_token ?? null}
        onApply={(gen) => {
          setName(gen.name);
          setDescription(gen.description);
          setSlug(slugFromName(gen.name));
          setKittens(
            gen.kittens.map((k) => ({
              id: crypto.randomUUID(),
              name: k.name,
              model_id: k.model_id,
              instructions: k.instructions,
            }))
          );
        }}
      />
    </div>
  );
}

