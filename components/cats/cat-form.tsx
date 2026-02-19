"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Sparkles,
  Save,
  Trash2,
} from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import { slugFromName } from "@/components/routers/router-form-utils";
import { saveRouterToSupabase } from "@/components/routers/router-save";

import { CAT_TEMPLATES, getCatTemplate } from "@/components/cats/cat-templates";
import type { CatKitten, CatRow } from "@/components/cats/types";
import {
  compileCatToRouterInstructions,
  normalizeCatSlug,
  normalizeKittens,
} from "@/components/cats/cat-compiler";
import { KittensEditor } from "@/components/cats/kittens-editor";
import { AiWizardModal } from "@/components/cats/ai-wizard-modal";
import { TestRunPanel } from "@/components/cats/test-run-panel";

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
      const { modelIds, instructions } = compileCatToRouterInstructions({
        catName: trimmedName,
        catDescription: description.trim(),
        kittens: kittensFinal,
      });

      // 1) Upsert cat record (source of truth for UX).
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

      // 2) Compile to router engine (runtime). We key it by slug for API calls.
      const { data: existingRouter } = await supabase
        .from("user_routers")
        .select("id, router_steps")
        .eq("user_id", user.id)
        .eq("slug", slugFinal)
        .limit(1)
        .maybeSingle();

      const routerSaved = await saveRouterToSupabase({
        supabase,
        user,
        editingId:
          existingRouter && typeof existingRouter.id === "string"
            ? existingRouter.id
            : undefined,
        payloadBase: {
          user_id: user.id,
          slug: slugFinal,
          name: trimmedName,
          instructions,
          model_id: modelIds[0] ?? "gemini-3-flash",
          fallback_model_id: modelIds[1] ?? null,
          updated_at: now,
        },
        modelIds,
        routingMode: "pipeline",
        // Preserve any existing router_steps (e.g. special vision pipelines like Home Visualizer).
        routerSteps:
          existingRouter && "router_steps" in existingRouter
            ? (existingRouter as { router_steps?: unknown }).router_steps ?? null
            : null,
      });
      if (!routerSaved.ok) {
        const msg =
          routerSaved.error instanceof Error
            ? routerSaved.error.message
            : String(routerSaved.error ?? "Failed to compile runtime");
        throw new Error(msg);
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
      // Best-effort: remove compiled runtime.
      if (normalizedSlug) {
        await supabase
          .from("user_routers")
          .delete()
          .eq("user_id", user.id)
          .eq("slug", normalizedSlug);
      }

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
                API Slug
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g., research-writer"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Call via{" "}
                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">
                  model=cat:{normalizedSlug || "your-slug"}
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
          <TestRunPanel
            catSlug={normalizedSlug}
            accessToken={session?.access_token ?? null}
            kittens={normalizeKittens(kittens)}
          />
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

