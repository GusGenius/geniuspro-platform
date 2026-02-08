"use client";

import { useState, useEffect, useCallback } from "react";
import { Key, Plus, Copy, Trash2, Check, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import { generateApiKey, hashApiKey, getKeyPrefix } from "@/lib/api-keys/generate";

interface ApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  rate_limit_rpm: number | null;
  last_used_at: string | null;
  created_at: string;
}

export default function ApiKeysPage() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error: fetchError } = await supabase
        .from("api_keys")
        .select("id, name, key_prefix, is_active, rate_limit_rpm, last_used_at, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Failed to fetch keys:", fetchError);
        setError("Failed to load API keys");
        return;
      }
      setKeys(data || []);
    } catch (err) {
      console.error("Failed to fetch keys:", err);
      setError("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreateKey = async () => {
    if (!user || !newKeyName.trim()) return;
    setCreating(true);
    setError(null);

    try {
      const plainKey = generateApiKey();
      const hash = await hashApiKey(plainKey);
      const prefix = getKeyPrefix(plainKey);

      const { error: insertError } = await supabase.from("api_keys").insert({
        user_id: user.id,
        name: newKeyName.trim(),
        key_hash: hash,
        key_prefix: prefix,
        is_active: true,
      });

      if (insertError) {
        setError(insertError.message);
        setCreating(false);
        return;
      }

      setNewKeySecret(plainKey);
      await fetchKeys();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create key";
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (deleteError) {
        console.error("Failed to delete key:", deleteError);
        return;
      }
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      console.error("Failed to delete key:", err);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard may fail in some contexts
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setNewKeyName("");
    setNewKeySecret(null);
    setError(null);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const timeAgo = (iso: string | null) => {
    if (!iso) return "Never";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">API Keys</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your API keys for accessing GeniusPro AI
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Key
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <p className="text-blue-600 dark:text-blue-300 text-sm">
            <strong>Important:</strong> API keys are shown only once when created. Store them securely.
          </p>
        </div>

        {/* Keys List */}
        <div className="space-y-4">
          {keys.length === 0 ? (
            <EmptyState onCreateClick={() => setShowCreateModal(true)} />
          ) : (
            keys.map((key) => (
              <KeyCard
                key={key.id}
                apiKey={key}
                copiedId={copiedId}
                onCopy={handleCopy}
                onDelete={handleDeleteKey}
                formatDate={formatDate}
                timeAgo={timeAgo}
              />
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateModal
          name={newKeyName}
          setName={setNewKeyName}
          secret={newKeySecret}
          creating={creating}
          error={error}
          copiedId={copiedId}
          onCreate={handleCreateKey}
          onCopy={handleCopy}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

/* ---------- Sub-components ---------- */

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
      <Key className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No API Keys</h3>
      <p className="text-gray-400 dark:text-gray-500 mb-4">Create your first API key to get started</p>
      <button
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Create Key
      </button>
    </div>
  );
}

function KeyCard({
  apiKey,
  copiedId,
  onCopy,
  onDelete,
  formatDate,
  timeAgo,
}: {
  apiKey: ApiKeyRow;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  onDelete: (id: string) => void;
  formatDate: (iso: string) => string;
  timeAgo: (iso: string | null) => string;
}) {
  return (
    <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-medium text-gray-900 dark:text-white">{apiKey.name}</h3>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                apiKey.is_active
                  ? "bg-green-500/15 text-green-500"
                  : "bg-gray-500/15 text-gray-400"
              }`}
            >
              {apiKey.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <code className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded font-mono">
              {apiKey.key_prefix}
            </code>
            <button
              onClick={() => onCopy(apiKey.key_prefix, apiKey.id)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Copy prefix"
            >
              {copiedId === apiKey.id ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400 dark:text-gray-500">
            <span>Created {formatDate(apiKey.created_at)}</span>
            <span>Last used {timeAgo(apiKey.last_used_at)}</span>
            {apiKey.rate_limit_rpm && <span>{apiKey.rate_limit_rpm} RPM</span>}
          </div>
        </div>

        <button
          onClick={() => onDelete(apiKey.id)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Delete key"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function CreateModal({
  name,
  setName,
  secret,
  creating,
  error,
  copiedId,
  onCreate,
  onCopy,
  onClose,
}: {
  name: string;
  setName: (v: string) => void;
  secret: string | null;
  creating: boolean;
  error: string | null;
  copiedId: string | null;
  onCreate: () => void;
  onCopy: (text: string, id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {secret ? "API Key Created" : "Create API Key"}
          </h2>
        </div>

        <div className="p-6">
          {secret ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-600 dark:text-amber-300">
                  <strong>Save this key!</strong> You won&apos;t be able to see it again.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your API Key
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm text-green-600 dark:text-green-400 bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded-lg break-all select-all font-mono">
                    {secret}
                  </code>
                  <button
                    onClick={() => onCopy(secret, "new")}
                    className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-900 rounded-lg transition-colors"
                  >
                    {copiedId === "new" ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Key Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onCreate()}
                placeholder="e.g., Production Key"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {secret ? "Done" : "Cancel"}
          </button>
          {!secret && (
            <button
              onClick={onCreate}
              disabled={!name.trim() || creating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Creating..." : "Create Key"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
