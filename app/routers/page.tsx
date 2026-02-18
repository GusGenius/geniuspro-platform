"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { GitBranch, Plus, Trash2, Pencil, Check, Loader2, Copy } from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import { getModelLabel as getModelLabelFromList } from "@/components/routers/available-models";

interface RouterRow {
  id: string;
  slug: string;
  name: string;
  instructions: string;
  model_id: string;
  fallback_model_id: string | null;
  model_ids?: string[] | null;
  routing_mode?: string | null;
  created_at: string;
}

export default function RoutersPage() {
  const { user } = useAuth();
  const [routers, setRouters] = useState<RouterRow[]>([]);
  const [loading, setLoading] = useState(true);
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
        .select("id, slug, name, instructions, model_id, fallback_model_id, model_ids, routing_mode, created_at")
        .eq("user_id", user.id)
        .order("name");

      if (withModelIds.error) {
        if (
          isMissingColumnError(withModelIds.error, "model_ids") ||
          isMissingColumnError(withModelIds.error, "routing_mode")
        ) {
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
          setError(null);
          return;
        }
        console.error("Failed to fetch routers:", withModelIds.error);
        setError("Failed to load routers");
        return;
      }

      setRouters(withModelIds.data || []);
      setError(null);
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
          <Link
            href="/routers/new"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Create Router
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

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
              <Link
                href="/routers/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Create Router
              </Link>
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
                            {r.routing_mode === "pipeline" ? (
                              <span className="ml-1.5 text-blue-500 dark:text-blue-400">(pipeline)</span>
                            ) : null}
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
                    <Link
                      href={`/routers/${r.id}/edit`}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
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
    </div>
  );
}
