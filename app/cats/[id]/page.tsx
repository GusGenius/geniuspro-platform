"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Save,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import { saveRouterToSupabase } from "@/components/routers/router-save";

interface UserCatRow {
  id: string;
  name: string;
  description: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export default function CatDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string | undefined) ?? "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [cat, setCat] = useState<UserCatRow | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const canSave = useMemo(() => {
    if (!cat) return false;
    if (saving || deleting) return false;
    if (!name.trim()) return false;
    return name.trim() !== cat.name || description.trim() !== (cat.description || "");
  }, [cat, name, description, saving, deleting]);

  const fetchCat = useCallback(async () => {
    if (!user) return;
    if (!isNonEmptyString(id)) return;
    setError(null);
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("user_cats")
        .select("id, name, description, slug, created_at, updated_at")
        .eq("id", id)
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        setError(fetchError.message);
        setCat(null);
        return;
      }
      if (!data) {
        setError("Cat not found");
        setCat(null);
        return;
      }

      const row = data as UserCatRow;
      setCat(row);
      setName(row.name);
      setDescription(row.description || "");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load cat";
      setError(msg);
      setCat(null);
    } finally {
      setLoading(false);
    }
  }, [user, id]);

  useEffect(() => {
    fetchCat();
  }, [fetchCat]);

  const handleSave = async () => {
    if (!user || !cat) return;
    const nextName = name.trim();
    if (!nextName) return;

    setSaving(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from("user_cats")
        .update({
          name: nextName,
          description: description.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", cat.id)
        .eq("user_id", user.id)
        .select("id, name, description, slug, created_at, updated_at")
        .single();

      if (updateError || !data) {
        setError(updateError?.message || "Failed to save cat");
        return;
      }

      const row = data as UserCatRow;

      // Keep the runtime (router engine) in sync with the cat definition.
      const { data: existingRouter } = await supabase
        .from("user_routers")
        .select("id")
        .eq("user_id", user.id)
        .eq("slug", row.slug)
        .limit(1)
        .maybeSingle();

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
        editingId:
          existingRouter && typeof existingRouter.id === "string"
            ? existingRouter.id
            : undefined,
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
        const msg =
          savedRouter.error instanceof Error
            ? savedRouter.error.message
            : String(savedRouter.error ?? "Failed to compile cat runtime");
        setError(msg);
        return;
      }

      setCat(row);
      setName(row.name);
      setDescription(row.description || "");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save cat";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !cat) return;
    setDeleting(true);
    setError(null);
    try {
      // Best-effort: remove the compiled runtime (router) first.
      await supabase
        .from("user_routers")
        .delete()
        .eq("user_id", user.id)
        .eq("slug", cat.slug);

      const { error: deleteError } = await supabase
        .from("user_cats")
        .delete()
        .eq("id", cat.id)
        .eq("user_id", user.id);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      router.push("/cats");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete cat";
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

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
                  {cat?.name || "Cat"}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Edit your cat config
                </p>
                {cat?.slug ? (
                  <div className="mt-2 flex items-center gap-2">
                    <code className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-900 px-2 py-0.5 rounded font-mono">
                      cat:{cat.slug}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard
                          .writeText(`cat:${cat.slug}`)
                          .then(() => {
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1500);
                          })
                          .catch(() => {});
                      }}
                      className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Copy API model ID"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleDelete().catch(() => {})}
            disabled={!cat || deleting || saving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/15 border border-red-500/30 text-red-500 dark:text-red-400 font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete cat"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete
              </>
            )}
          </button>
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
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="What does this cat do?"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => fetchCat().catch(() => {})}
                disabled={saving || deleting}
                className="px-4 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
              <button
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
      </div>
    </div>
  );
}

