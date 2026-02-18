"use client";

import { useState, useEffect, useCallback } from "react";
import { GitBranch, Plus, Trash2, Pencil, Check, Loader2, Copy } from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import { ModelsOrderEditor } from "@/components/routers/models-order-editor";
import { AVAILABLE_MODELS, getModelLabel as getModelLabelFromList } from "@/components/routers/available-models";

interface RouterRow {
  id: string;
  slug: string;
  name: string;
  instructions: string;
  model_id: string;
  fallback_model_id: string | null;
  model_ids?: string[] | null;
  created_at: string;
}

const API_BASE = "https://api.geniuspro.io/v1";

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function RoutersPage() {
  const { user } = useAuth();
  const [routers, setRouters] = useState<RouterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formInstructions, setFormInstructions] = useState("");
  const [formModelIds, setFormModelIds] = useState<string[]>(["gemini-3-flash"]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function isMissingColumnError(err: unknown, column: string): boolean {
    const msg =
      typeof err === "object" && err !== null && "message" in err
        ? String((err as { message?: unknown }).message ?? "")
        : "";
    return msg.toLowerCase().includes(`column user_routers.${column}`) && msg.toLowerCase().includes("does not exist");
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

  const fetchRouters = useCallback(async () => {
    if (!user) return;
    try {
      const withModelIds = await supabase
        .from("user_routers")
        .select("id, slug, name, instructions, model_id, fallback_model_id, model_ids, created_at")
        .eq("user_id", user.id)
        .order("name");

      if (withModelIds.error) {
        if (isMissingColumnError(withModelIds.error, "model_ids")) {
          const legacy = await supabase
            .from("user_routers")
            .select("id, slug, name, instructions, model_id, fallback_model_id, created_at")
            .eq("user_id", user.id)
            .order("name");
          if (legacy.error) {
            console.error("Failed to fetch routers:", legacy.error);
            setError("Failed to load routers");
            return;
          }
          setRouters(legacy.data || []);
          return;
        }
        console.error("Failed to fetch routers:", withModelIds.error);
        setError("Failed to load routers");
        return;
      }

      setRouters(withModelIds.data || []);
    } catch (err) {
      console.error("Failed to fetch routers:", err);
      setError("Failed to load routers");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRouters();
  }, [fetchRouters]);

  const resetForm = () => {
    setFormName("");
    setFormSlug("");
    setFormInstructions("");
    setFormModelIds(["gemini-3-flash"]);
    setEditingId(null);
    setError(null);
  };

  const handleCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (r: RouterRow) => {
    setFormName(r.name);
    setFormSlug(r.slug);
    setFormInstructions(r.instructions);
    const ids = Array.isArray(r.model_ids) && r.model_ids.length > 0
      ? r.model_ids
      : normalizeModelIds([r.model_id, r.fallback_model_id ?? null]);
    setFormModelIds(ids.length > 0 ? ids : ["gemini-3-flash"]);
    setEditingId(r.id);
    setShowModal(true);
  };

  const handleNameChange = (name: string) => {
    setFormName(name);
    if (!editingId) setFormSlug(slugFromName(name));
  };

  const handleSave = async () => {
    if (!user) return;
    const slug = formSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
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
        // Keep legacy columns populated for backward compatibility.
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
      setShowModal(false);
      resetForm();
      await fetchRouters();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Delete this router?")) return;
    try {
      await supabase
        .from("user_routers")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      setRouters((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to delete router:", err);
    }
  };

  const handleCopy = async (routerId: string, slug: string) => {
    const modelId = `router:${slug}`;
    try {
      await navigator.clipboard.writeText(modelId);
      setCopiedId(routerId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard may not be available
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getModelLabel = (id: string) => getModelLabelFromList(id);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Routers
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Create custom routers with instructions and model selection. Call with{" "}
              <code className="text-xs bg-gray-200 dark:bg-gray-800 px-1 rounded">model=router:your-slug</code>
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Create Router
          </button>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <p className="text-blue-600 dark:text-blue-300 text-sm">
            <strong>Example:</strong> Create a &quot;house-analysis&quot; router with instructions like &quot;You analyze real estate photos...&quot; 
            Then call <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">model=router:house-analysis</code> with your API key.
          </p>
        </div>

        <div className="space-y-4">
          {routers.length === 0 ? (
            <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
              <GitBranch className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                No Routers Yet
              </h3>
              <p className="text-gray-400 dark:text-gray-500 mb-6">
                Create your first router to add custom instructions and model selection
              </p>
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Create Router
              </button>
            </div>
          ) : (
            routers.map((r) => (
              <div
                key={r.id}
                className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {r.name || r.slug}
                      </h3>
                      <code className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-900 px-2 py-0.5 rounded font-mono">
                        router:{r.slug}
                      </code>
                      {(() => {
                        const ids =
                          Array.isArray(r.model_ids) && r.model_ids.length > 0
                            ? r.model_ids
                            : normalizeModelIds([r.model_id, r.fallback_model_id ?? null]);
                        const first = ids[0] ?? r.model_id;
                        const more = Math.max(ids.length - 1, 0);
                        return (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            → {getModelLabel(first)}
                            {more > 0 ? ` +${more}` : ""}
                          </span>
                        );
                      })()}
                    </div>
                    {r.instructions && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                        {r.instructions}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                      <span>Created {formatDate(r.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleCopy(r.id, r.slug)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Copy model ID"
                    >
                      {copiedId === r.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(r)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingId ? "Edit Router" : "Create Router"}
              </h2>
            </div>

            <div className="p-6 space-y-4">
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

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-4 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : editingId ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
