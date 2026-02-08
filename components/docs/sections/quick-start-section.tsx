"use client";

import { Check, Copy } from "lucide-react";

import {
  API_BASE_URL_SUPERINTELLIGENCE,
  API_BASE_URL_CODING_SUPERINTELLIGENCE,
  API_BASE_URL_GATEWAY,
  MODEL_SUPERINTELLIGENCE,
} from "@/components/docs/docs-constants";

type Props = {
  icon: React.ComponentType<{ className?: string }>;
  copiedText: string | null;
  onCopyText: (text: string, id: string) => void;
};

export function QuickStartSection({ icon: Icon, copiedText, onCopyText }: Props) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-400" />
        Quick Start
      </h2>

      <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 space-y-4">
        <p className="text-gray-600 dark:text-gray-300">
          GeniusPro API supports the `/v1` chat endpoints, and also includes Coding Superintelligence endpoints optimized for Cursor workflows.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-gray-200 dark:bg-gray-900 rounded-lg p-3 sm:p-4 relative group overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">GeniusPro Superintelligence Base URL</div>
              <button
                onClick={() => onCopyText(API_BASE_URL_SUPERINTELLIGENCE, "base-url-si")}
                className="p-1.5 rounded hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex-shrink-0"
                title="Copy base URL"
              >
                {copiedText === "base-url-si" ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <code className="text-blue-500 dark:text-blue-400 font-mono text-sm break-all">{API_BASE_URL_SUPERINTELLIGENCE}</code>
          </div>

          <div className="bg-gray-200 dark:bg-gray-900 rounded-lg p-3 sm:p-4 relative group overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">GeniusPro Coding Superintelligence Base URL</div>
              <button
                onClick={() => onCopyText(API_BASE_URL_CODING_SUPERINTELLIGENCE, "base-url-coding")}
                className="p-1.5 rounded hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex-shrink-0"
                title="Copy base URL"
              >
                {copiedText === "base-url-coding" ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <code className="text-blue-500 dark:text-blue-400 font-mono text-sm break-all">{API_BASE_URL_CODING_SUPERINTELLIGENCE}</code>
          </div>

          <div className="bg-gray-200 dark:bg-gray-900 rounded-lg p-3 sm:p-4 relative group overflow-hidden md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">Model (router)</div>
              <button
                onClick={() => onCopyText(MODEL_SUPERINTELLIGENCE, "model-name")}
                className="p-1.5 rounded hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex-shrink-0"
                title="Copy model name"
              >
                {copiedText === "model-name" ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <code className="text-green-600 dark:text-green-400 font-mono text-sm break-all">{MODEL_SUPERINTELLIGENCE}</code>
          </div>

          <div className="bg-gray-200 dark:bg-gray-900 rounded-lg p-3 sm:p-4 relative group overflow-hidden md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">Gateway Base URL (coder + voice)</div>
              <button
                onClick={() => onCopyText(API_BASE_URL_GATEWAY, "base-url-gateway")}
                className="p-1.5 rounded hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex-shrink-0"
                title="Copy base URL"
              >
                {copiedText === "base-url-gateway" ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <code className="text-blue-500 dark:text-blue-400 font-mono text-sm break-all">{API_BASE_URL_GATEWAY}</code>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Use this for <span className="font-mono">geniuspro-coder-v1</span> and <span className="font-mono">geniuspro-voice</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

