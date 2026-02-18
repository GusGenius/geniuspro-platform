"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import { ModelsOrderEditor } from "@/components/routers/models-order-editor";
import { AVAILABLE_MODELS } from "@/components/routers/available-models";

export type RouterFormData = {
  name: string;
  slug: string;
  instructions: string;
  model_ids: string[];
};

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

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

function isMissingColumnError(err: unknown, column: string): boolean {
  const msg =
    typeof err === "object" && err !== null && "message" in err
      ? String((err as { message?: unknown }).message ?? "")
      : "";
  return (
    msg.toLowerCase().includes(`column user_routers.${column}`) &&
    msg.toLowerCase().includes("does not exist")
  );
}

type Props = {
  mode: "create" | "edit";
  editingId?: string;
  initialData: RouterFormData;
  backHref: string;
  backLabel: string;
};

export function RouterForm({
  mode,
  editingId,
  initialData,
  backHref,
  backLabel,
}: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [formName, setFormName] = useState(initialData.name);
  const [formSlug, setFormSlug] = useState(initialData.slug);
  const [formInstructions, setFormInstructions] = useState(initialData.instructions);
  const [formModelIds, setFormModelIds] = useState(initialData.model_ids);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (name: string) => {
    setFormName(name);
    if (mode === "create") setFormSlug(slugFromName(name));
  };

  const handleSave = async () => {
    if (!user) return;
    const slug = formSlug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (!slug) {
      setError("Slug is required (e.g. house-analysis)");
      return;
    }
    const cleanedModelIds = normalizeModelIds(formModelIds);
    if (cleanedModelIds.length === 0) {
      setError("Select at least one model.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payloadBase = {
        user_id: user.id,
        slug,
        name: formName.trim() || slug,
        instructions: formInstructions.trim(),
        model_id: cleanedModelIds[0],
        fallback_model_id: cleanedModelIds[1] ?? null,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const updateWithModelIds = await supabase
          .from("user_routers")
          .update({
            name: payloadBase.name,
            instructions: payloadBase.instructions,
            model_id: payloadBase.model_id,
            fallback_model_id: payloadBase.fallback_model_id,
            model_ids: cleanedModelIds,
            updated_at: payloadBase.updated_at,
          })
          .eq("id", editingId)
          .eq("user_id", user.id);

        if (updateWithModelIds.error) {
          if (!isMissingColumnError(updateWithModelIds.error, "model_ids")) {
            throw updateWithModelIds.error;
          }
          const legacyUpdate = await supabase
            .from("user_routers")
            .update({
              name: payloadBase.name,
              instructions: payloadBase.instructions,
              model_id: payloadBase.model_id,
              fallback_model_id: payloadBase.fallback_model_id,
              updated_at: payloadBase.updated_at,
            })
            .eq("id", editingId)
            .eq("user_id", user.id);
          if (legacyUpdate.error) throw legacyUpdate.error;
        }
      } else {
        const insertWithModelIds = await supabase
          .from("user_routers")
          .insert({ ...payloadBase, model_ids: cleanedModelIds });

        if (insertWithModelIds.error) {
          if (isMissingColumnError(insertWithModelIds.error, "model_ids")) {
            const legacyInsert = await supabase
              .from("user_routers")
              .insert(payloadBase);
            if (legacyInsert.error) {
              if (legacyInsert.error.code === "23505") {
                setError("A router with this slug already exists");
              } else {
                throw legacyInsert.error;
              }
              setSaving(false);
              return;
            }
          } else {
            if (insertWithModelIds.error.code === "23505") {
              setError("A router with this slug already exists");
            } else {
              throw insertWithModelIds.error;
            }
            setSaving(false);
            return;
          }
        }
      }
      router.push("/routers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="max-w-lg mx-auto">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>

        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {mode === "create" ? "Create Router" : "Edit Router"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          {mode === "create"
            ? "Create a custom router with instructions and model selection."
            : "Update your router settings."}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., House Analysis"
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Slug <span className="text-gray-400">(used in model=router:slug)</span>
            </label>
            <input
              type="text"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              placeholder="house-analysis"
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Instructions (system prompt)
            </label>
            <textarea
              value={formInstructions}
              onChange={(e) => setFormInstructions(e.target.value)}
              placeholder="You are an expert at analyzing real estate photos. Describe the room, style, and suggest improvements..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <ModelsOrderEditor
              label="Models"
              hint="try in order"
              modelIds={formModelIds}
              options={AVAILABLE_MODELS}
              maxModels={5}
              onChange={setFormModelIds}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            href={backHref}
            className="px-4 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : mode === "create" ? "Create" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
