"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Cat, Plus, Trash2, Loader2, AlertTriangle } from "lucide-react";

interface UserCatRow {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function CatsPage() {
  const { user } = useAuth();
  const [cats, setCats] = useState<UserCatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canCreate = useMemo(() => newName.trim().length > 0, [newName]);

  const fetchCats = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("user_cats")
        .select("id, name, description, created_at, updated_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

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
  }, [user]);

  useEffect(() => {
    fetchCats();
  }, [fetchCats]);

  const handleCreate = async () => {
    if (!user) return;
    const name = newName.trim();
    if (!name) return;

    setCreating(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("user_cats")
        .insert({
          user_id: user.id,
          name,
          description: "",
        })
        .select("id, name, description, created_at, updated_at")
        .single();

      if (insertError || !data) {
        setError(insertError?.message || "Failed to create cat");
        return;
      }

      setCats((prev) => [data as UserCatRow, ...prev]);
      setShowCreateModal(false);
      setNewName("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create cat";
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    setDeletingId(id);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from("user_cats")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

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
              Cats
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Create reusable multi-agent configs you can call from the API
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Create Cat
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

        <div className="space-y-4">
          {cats.length === 0 ? (
            <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
              <Cat className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                No Cats Yet
              </h3>
              <p className="text-gray-400 dark:text-gray-500 mb-6">
                Create your first cat to start saving multi-agent setups.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Create Cat
              </button>
            </div>
          ) : (
            cats.map((catRow) => (
              <div
                key={catRow.id}
                className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {catRow.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Created {new Date(catRow.created_at).toLocaleDateString("en-US")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(catRow.id)}
                    disabled={deletingId === catRow.id}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
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
            ))
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-md"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create Cat
              </h2>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Cat name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="e.g., Research + Writer"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                This creates a saved config. Next step is adding roles/agents to
                the cat.
              </p>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewName("");
                }}
                className="px-4 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!canCreate || creating}
                className="px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

