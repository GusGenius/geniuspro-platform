"use client";

import { useState, useEffect, useCallback } from "react";
import { Key, Plus, Copy, Trash2, Check, Loader2, AlertTriangle } from "lucide-react";

import { type SelectOption } from "@/components/ui/profile-select";
import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import { generateApiKey, hashApiKey, getKeyPrefix } from "@/lib/api-keys/generate";

interface ApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
  profile: string;
  is_active: boolean;
  rate_limit_rpm: number | null;
  last_used_at: string | null;
  created_at: string;
}

type ApiKeyProfile = "openai_compat" | "coding_superintelligence" | "gateway" | "vision" | "gutter" | "universal";

const PROFILE_DISPLAY: Record<ApiKeyProfile, { label: string; color: string; hint: string }> = {
  openai_compat: {
    label: "GeniusPro API (Chat)",
    color: "bg-blue-500/20 text-blue-400",
    hint: "Use with https://api.geniuspro.io/v1 for chat (OpenAI-compatible, Cursor).",
  },
  coding_superintelligence: {
    label: "GeniusPro Coding Superintelligence",
    color: "bg-purple-500/20 text-purple-400",
    hint: "Use with https://api.geniuspro.io/coding-superintelligence/v1 (Cursor).",
  },
  gateway: {
    label: "GeniusPro Gateway (Coder + Voice)",
    color: "bg-emerald-500/20 text-emerald-400",
    hint: "Use with https://api.geniuspro.io/v1 for GeniusPro-coder-v1 and GeniusPro-voice-v1.",
  },
  vision: {
    label: "GeniusPro Vision (SAM 3)",
    color: "bg-cyan-500/20 text-cyan-400",
    hint: "Use with https://api.geniuspro.io/vision/v1 for image and video segmentation.",
  },
  gutter: {
    label: "Gutter Empire (Unity)",
    color: "bg-fuchsia-500/20 text-fuchsia-400",
    hint: "Use with https://api.geniuspro.io/gutter for Gutter Empire Unity app.",
  },
  universal: {
    label: "Legacy Universal",
    color: "bg-gray-500/20 text-gray-400",
    hint: "Deprecated. Rotate this key to one of the two profiles.",
  },
};

type CreatableApiKeyProfile = Exclude<ApiKeyProfile, "universal">;

/** Map raw model IDs to friendly display names + colors */
const MODEL_DISPLAY: Record<string, { label: string; color: string }> = {
  "GeniusPro-coder-v1": { label: "Coder", color: "bg-blue-500/20 text-blue-400" },
  "GeniusPro-agi-1.2": { label: "Superintelligence", color: "bg-purple-500/20 text-purple-400" },
  "GeniusPro-coding-agi-1.2": { label: "Coding Superintelligence", color: "bg-fuchsia-500/20 text-fuchsia-400" },
  "GeniusPro-voice-v1": { label: "Voice", color: "bg-amber-500/20 text-amber-400" },
  "GeniusPro-vision-sam3": { label: "Vision SAM 3", color: "bg-cyan-500/20 text-cyan-400" },
};

function getModelBadge(model: string): { label: string; color: string } {
  return MODEL_DISPLAY[model] || { label: model, color: "bg-gray-500/20 text-gray-400" };
}

export default function ApiKeysPage() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyProfiles, setNewKeyProfiles] = useState<Set<CreatableApiKeyProfile>>(new Set(["openai_compat"]));
  const [newKeySecrets, setNewKeySecrets] = useState<Array<{ profile: string; key: string }>>([]);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [keyModels, setKeyModels] = useState<Record<string, string[]>>({});

  const profileOptions: readonly SelectOption<CreatableApiKeyProfile>[] = [
    {
      value: "openai_compat",
      label: PROFILE_DISPLAY.openai_compat.label,
      hint: PROFILE_DISPLAY.openai_compat.hint,
    },
    {
      value: "coding_superintelligence",
      label: `${PROFILE_DISPLAY.coding_superintelligence.label} (Cursor)`,
      hint: PROFILE_DISPLAY.coding_superintelligence.hint,
    },
    {
      value: "gateway",
      label: PROFILE_DISPLAY.gateway.label,
      hint: PROFILE_DISPLAY.gateway.hint,
    },
    {
      value: "vision",
      label: PROFILE_DISPLAY.vision.label,
      hint: PROFILE_DISPLAY.vision.hint,
    },
    {
      value: "gutter",
      label: PROFILE_DISPLAY.gutter.label,
      hint: PROFILE_DISPLAY.gutter.hint,
    },
  ] as const;

  const fetchKeys = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error: fetchError } = await supabase
        .from("api_keys")
        .select("id, name, key_prefix, profile, is_active, rate_limit_rpm, last_used_at, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Failed to fetch keys:", fetchError);
        setError("Failed to load API keys");
        return;
      }
      setKeys(data || []);

      // Fetch distinct models used per key
      if (data && data.length > 0) {
        const keyIds = data.map((k) => k.id);
        const { data: usageRows } = await supabase
          .from("usage_logs")
          .select("api_key_id, model")
          .in("api_key_id", keyIds);

        if (usageRows) {
          const modelMap: Record<string, Set<string>> = {};
          for (const row of usageRows) {
            if (!row.model) continue;
            if (!modelMap[row.api_key_id]) modelMap[row.api_key_id] = new Set();
            modelMap[row.api_key_id].add(row.model);
          }
          const result: Record<string, string[]> = {};
          for (const [keyId, models] of Object.entries(modelMap)) {
            result[keyId] = Array.from(models);
          }
          setKeyModels(result);
        }
      }
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
    if (!user || !newKeyName.trim() || newKeyProfiles.size === 0) return;
    setCreating(true);
    setError(null);

    try {
      const createdKeys: Array<{ profile: string; key: string }> = [];
      
      // Create one key per selected profile
      for (const profile of Array.from(newKeyProfiles)) {
        const plainKey = generateApiKey();
        const hash = await hashApiKey(plainKey);
        const prefix = getKeyPrefix(plainKey);

        const keyName = newKeyProfiles.size > 1 
          ? `${newKeyName.trim()} (${PROFILE_DISPLAY[profile].label})`
          : newKeyName.trim();

        const { error: insertError } = await supabase.from("api_keys").insert({
          user_id: user.id,
          name: keyName,
          profile: profile,
          key_hash: hash,
          key_prefix: prefix,
          is_active: true,
        });

        if (insertError) {
          setError(`Failed to create key for ${PROFILE_DISPLAY[profile].label}: ${insertError.message}`);
          setCreating(false);
          return;
        }

        createdKeys.push({ profile, key: plainKey });
      }

      setNewKeySecrets(createdKeys);
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
      // Clipboard may not be available
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setNewKeyName("");
    setNewKeyProfiles(new Set(["openai_compat"]));
    setNewKeySecrets([]);
    setError(null);
  };

  const toggleProfile = (profile: CreatableApiKeyProfile) => {
    setNewKeyProfiles((prev) => {
      const next = new Set(prev);
      if (next.has(profile)) {
        next.delete(profile);
      } else {
        next.add(profile);
      }
      return next;
    });
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
    return `${Math.floor(hrs / 24)}d ago`;
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">API Keys</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your API keys for accessing GeniusPro AI
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm w-full sm:w-auto"
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
            <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
              <Key className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No API Keys</h3>
              <p className="text-gray-400 dark:text-gray-500 mb-6">Create your first API key to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Create Key
              </button>
            </div>
          ) : (
            keys.map((key) => (
              <div
                key={key.id}
                className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">{key.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                          key.is_active
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {key.is_active ? "Active" : "Inactive"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                          PROFILE_DISPLAY[(key.profile as ApiKeyProfile) || "universal"]?.color || "bg-gray-500/20 text-gray-400"
                        }`}
                        title={PROFILE_DISPLAY[(key.profile as ApiKeyProfile) || "universal"]?.hint || "Profile"}
                      >
                        {PROFILE_DISPLAY[(key.profile as ApiKeyProfile) || "universal"]?.label || key.profile}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <code className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded font-mono truncate">
                        {key.key_prefix}
                      </code>
                    </div>

                    {/* Model badges */}
                    {keyModels[key.id] && keyModels[key.id].length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {keyModels[key.id].map((model) => {
                          const badge = getModelBadge(model);
                          return (
                            <span
                              key={model}
                              className={`px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-1 text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                      <span>Created {formatDate(key.created_at)}</span>
                      <span>Last used {timeAgo(key.last_used_at)}</span>
                      {key.rate_limit_rpm && <span>{key.rate_limit_rpm} RPM</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteKey(key.id)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                    title="Delete key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-md"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {newKeySecrets.length > 0 ? "API Key Created" : "Create API Key"}
              </h2>
            </div>

            <div className="p-6">
              {newKeySecrets.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-600 dark:text-yellow-300">
                      <strong>Save these keys!</strong> You won&apos;t be able to see them again.
                      {newKeySecrets.length > 1 && " One key was created for each selected service."}
                    </p>
                  </div>

                  {newKeySecrets.map(({ profile, key }, idx) => (
                    <div key={profile}>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                        {PROFILE_DISPLAY[profile as ApiKeyProfile].label} API Key
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm text-green-600 dark:text-green-400 bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded-lg break-all select-all font-mono">
                          {key}
                        </code>
                        <button
                          onClick={() => handleCopy(key, `new-${idx}`)}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-900 rounded-lg transition-colors"
                        >
                          {copiedId === `new-${idx}` ? (
                            <Check className="w-5 h-5 text-green-400" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
                    placeholder="e.g., Production Key"
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />

                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3 mt-4">
                    Select Services
                  </label>
                  <div className="space-y-3">
                    {profileOptions.map((option) => {
                      const isSelected = newKeyProfiles.has(option.value);
                      return (
                        <label
                          key={option.value}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-blue-500/10 border-blue-500/30 dark:bg-blue-500/10 dark:border-blue-500/30"
                              : "bg-gray-100/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/70"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleProfile(option.value)}
                            className="mt-0.5 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PROFILE_DISPLAY[option.value as ApiKeyProfile].color}`}>
                                {option.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {option.hint}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  {newKeyProfiles.size === 0 && (
                    <p className="mt-2 text-xs text-red-400">Please select at least one service.</p>
                  )}
                  {newKeyProfiles.size > 1 && (
                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                      Multiple keys will be created (one per selected service).
                    </p>
                  )}

                  {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
              >
                {newKeySecrets.length > 0 ? "Done" : "Cancel"}
              </button>
              {newKeySecrets.length === 0 && (
                <button
                  onClick={handleCreateKey}
                  disabled={!newKeyName.trim() || creating || newKeyProfiles.size === 0}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? `Creating ${newKeyProfiles.size} key${newKeyProfiles.size > 1 ? "s" : ""}...` : `Create Key${newKeyProfiles.size > 1 ? "s" : ""}`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
