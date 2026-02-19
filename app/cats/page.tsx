"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useProfile } from "@/lib/profile/use-profile";
import { supabase } from "@/lib/supabase/client";
import { Cat, Plus, Trash2, Loader2, AlertTriangle, Copy, Check, Search, Zap } from "lucide-react";
import { CatsSkeleton } from "@/components/pages/cats-skeleton";

interface UserCatRow {
  id: string;
  name: string;
  description: string;
  slug: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

const SYSTEM_AGI_MODELS = [
  { id: "geniuspro-agi-1.2", label: "Superintelligence", description: "GeniusPro chat model" },
  { id: "geniuspro-code-agi-1.2", label: "Coding Superintelligence", description: "GeniusPro coding model" },
] as const;

export default function CatsPage() {
  const { user } = useAuth();
  const { isAdmin } = useProfile(user?.id);
  const [cats, setCats] = useState<UserCatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredCats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return cats;
    return cats.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [cats, searchQuery]);

  const fetchCats = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      let query = supabase
        .from("user_cats")
        .select("id, name, description, slug, created_at, updated_at, user_id")
        .order("created_at", { ascending: false });
      if (!isAdmin) {
        query = query.eq("user_id", user.id);
      }
      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        setCats([]);
        return;
      }
      setCats((data as UserCatRow[]) ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load cats";
      setError(msg);
      setCats([]);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    fetchCats();
  }, [fetchCats]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    setDeletingId(id);
    setError(null);
    try {
      let deleteQuery = supabase.from("user_cats").delete().eq("id", id);
      if (!isAdmin) {
        deleteQuery = deleteQuery.eq("user_id", user.id);
      }
      const { error: deleteError } = await deleteQuery;

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      setCats((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete cat";
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard may not be available
    }
  };

  const handleCopySystemModel = (modelId: string) => {
    handleCopy(modelId, `system:${modelId}`).catch(() => {});
  };

  if (loading) {
    return <CatsSkeleton />;
  }

  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Cats
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Create reusable multi-agent configs you can call from the API
            </p>
          </div>
          <Link
            href="/cats/new"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Create Cat
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* System AGI models - super admins only */}
        {isAdmin && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                System models
              </h2>
              <Link
                href="/cats/system"
                className="text-xs text-blue-500 hover:text-blue-400 font-medium"
              >
                Edit as admin
              </Link>
            </div>
            <div className="space-y-3">
              {SYSTEM_AGI_MODELS.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Zap className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {m.label}
                      </h3>
                      <div className="mt-1">
                        <code className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-900 px-2 py-0.5 rounded font-mono">
                          {m.id}
                        </code>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {m.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopySystemModel(m.id)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors flex-shrink-0"
                    title="Copy API model ID"
                  >
                    {copiedId === `system:${m.id}` ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User cats */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Your cats
          </h2>
        </div>

        {cats.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="search"
              placeholder="Search by name, slug, or description"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b8a9] focus:border-transparent text-sm"
              aria-label="Search cats"
            />
          </div>
        )}

        <div className="space-y-4">
          {filteredCats.length === 0 ? (
            <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
              <Cat className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                {searchQuery.trim() ? "No matching cats" : "No Cats Yet"}
              </h3>
              <p className="text-gray-400 dark:text-gray-500 mb-6">
                {searchQuery.trim()
                  ? "Try a different search term."
                  : "Create your first cat to start saving multi-agent setups."}
              </p>
              {!searchQuery.trim() && (
                <Link
                  href="/cats/new"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Cat
                </Link>
              )}
            </div>
          ) : (
            filteredCats.map((catRow) => (
              <Link
                key={catRow.id}
                href={`/cats/${catRow.id}`}
                className="block bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {catRow.name}
                    </h3>
                    <div className="mt-2">
                      <code className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-900 px-2 py-0.5 rounded font-mono">
                        cat:{catRow.slug}
                      </code>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Created {new Date(catRow.created_at).toLocaleDateString("en-US")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCopy(`cat:${catRow.slug}`, catRow.id).catch(() => {});
                      }}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Copy API model ID"
                    >
                      {copiedId === catRow.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        // Prevent navigating to edit page when deleting from the list.
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(catRow.id).catch(() => {});
                      }}
                      disabled={deletingId === catRow.id}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      title="Delete cat"
                    >
                      {deletingId === catRow.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

