"use client";

import { useState } from "react";
import { Key, Plus, Copy, Eye, EyeOff, Trash2, Check } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: Date;
  lastUsed: Date | null;
  totalRequests: number;
  totalTokens: number;
  isActive: boolean;
}

export default function ApiKeysPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mock data - will be replaced with real data from Supabase
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "Production Key",
      keyPrefix: "sk-gp-a1b2c3",
      createdAt: new Date("2026-02-01"),
      lastUsed: new Date("2026-02-05T10:30:00"),
      totalRequests: 1234,
      totalTokens: 2500000,
      isActive: true,
    },
    {
      id: "2",
      name: "Development Key",
      keyPrefix: "sk-gp-x9y8z7",
      createdAt: new Date("2026-02-03"),
      lastUsed: new Date("2026-02-04T15:45:00"),
      totalRequests: 89,
      totalTokens: 45000,
      isActive: true,
    },
  ]);

  const handleCreateKey = () => {
    // Generate mock key - will be replaced with real API call
    const mockKey = `sk-gp-${Math.random().toString(36).substring(2, 26)}`;
    setNewKeySecret(mockKey);
    
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName || "New API Key",
      keyPrefix: mockKey.substring(0, 12),
      createdAt: new Date(),
      lastUsed: null,
      totalRequests: 0,
      totalTokens: 0,
      isActive: true,
    };
    
    setApiKeys([newKey, ...apiKeys]);
  };

  const handleCopyKey = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id));
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setNewKeyName("");
    setNewKeySecret(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRelativeTime = (date: Date | null) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">API Keys</h1>
            <p className="text-gray-400 mt-1">Manage your API keys for accessing GeniusPro AI</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Key
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <p className="text-blue-300 text-sm">
            <strong>Important:</strong> API keys are shown only once when created. Store them securely.
          </p>
        </div>

        {/* API Keys List */}
        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
              <Key className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No API Keys</h3>
              <p className="text-gray-500 mb-4">Create your first API key to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Key
              </button>
            </div>
          ) : (
            apiKeys.map((key) => (
              <div
                key={key.id}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-white">{key.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          key.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {key.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <code className="text-sm text-gray-400 bg-gray-900 px-2 py-1 rounded">
                        {key.keyPrefix}...
                      </code>
                      <button
                        onClick={() => handleCopyKey(key.keyPrefix, key.id)}
                        className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
                        title="Copy key prefix"
                      >
                        {copiedId === key.id ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400">
                      <span>Created: {formatDate(key.createdAt)}</span>
                      <span>Last used: {formatRelativeTime(key.lastUsed)}</span>
                      <span>Requests: {formatNumber(key.totalRequests)}</span>
                      <span>Tokens: {formatNumber(key.totalTokens)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteKey(key.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">
                {newKeySecret ? "API Key Created" : "Create API Key"}
              </h2>
            </div>

            <div className="p-6">
              {newKeySecret ? (
                <div className="space-y-4">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-300 text-sm">
                      <strong>Save this key!</strong> You won't be able to see it again.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Your API Key
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm text-green-400 bg-gray-900 px-3 py-2 rounded-lg break-all">
                        {newKeySecret}
                      </code>
                      <button
                        onClick={() => handleCopyKey(newKeySecret, "new")}
                        className="p-2 text-gray-400 hover:text-white bg-gray-900 rounded-lg transition-colors"
                      >
                        {copiedId === "new" ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production Key"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                {newKeySecret ? "Done" : "Cancel"}
              </button>
              {!newKeySecret && (
                <button
                  onClick={handleCreateKey}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Create Key
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
