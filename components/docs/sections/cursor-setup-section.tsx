"use client";

import { Check, Copy } from "lucide-react";
import { CollapsibleSection } from "@/components/docs/collapsible-section";

import {
  API_BASE_URL,
  MODEL_GPT_CODEX,
  MODEL_AGI,
  MODEL_CODE_AGI,
} from "@/components/docs/docs-constants";

type Props = {
  icon: React.ComponentType<{ className?: string }>;
  copiedText: string | null;
  onCopyText: (text: string, id: string) => void;
};

export function CursorSetupSection({ icon: Icon, copiedText, onCopyText }: Props) {
  return (
    <CollapsibleSection
      id="cursor-setup"
      title="Cursor Setup for Coding"
      icon={Icon}
      defaultOpen={false}
      description={
        <>
          Configure Cursor to use GeniusPro for the best coding experience. Use{" "}
          <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{MODEL_CODE_AGI}</code> (our coding model) or{" "}
          <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{MODEL_GPT_CODEX}</code> for maximum capability.
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Step 1: Get your API key</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Create an API key at{" "}
            <a href="/api-keys" className="text-blue-500 dark:text-blue-400 underline underline-offset-2 hover:text-blue-600">
              API Keys
            </a>
            . Copy it—you won&apos;t see it again.
          </p>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Step 2: Configure Cursor</h3>
          <ol className="list-decimal list-inside space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <li>Open Cursor Settings (gear icon in bottom left)</li>
            <li>Go to <strong>Models</strong> or <strong>Features → Models</strong></li>
            <li>Enable <strong>Override OpenAI Base URL</strong></li>
            <li>Set Base URL to:</li>
          </ol>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 text-sm text-blue-500 dark:text-blue-400 bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded-lg font-mono break-all">
              {API_BASE_URL}
            </code>
            <button
              onClick={() => onCopyText(API_BASE_URL, "cursor-base-url")}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-900 rounded-lg transition-colors flex-shrink-0"
              title="Copy"
            >
              {copiedText === "cursor-base-url" ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
          <ol start={5} className="list-decimal list-inside space-y-1 mt-3 text-sm text-gray-600 dark:text-gray-300">
            <li>Set API Key to your GeniusPro key</li>
            <li>Select model: <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{MODEL_CODE_AGI}</code> (coding) or <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{MODEL_AGI}</code> (chat)</li>
          </ol>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Recommended model for coding</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Use <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{MODEL_CODE_AGI}</code> for Composer and Chat when coding. For maximum capability on every request, use <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{MODEL_GPT_CODEX}</code> directly.
          </p>
          <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick reference</p>
            <div className="space-y-1 text-sm font-mono">
              <div><span className="text-gray-500 dark:text-gray-400">Base URL:</span> <span className="text-blue-500 dark:text-blue-400">{API_BASE_URL}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Coding model:</span> <span className="text-emerald-500 dark:text-emerald-400">{MODEL_CODE_AGI}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Chat model:</span> <span className="text-blue-500 dark:text-blue-400">{MODEL_AGI}</span></div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Tiered setup (optional)</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            For cost optimization: use <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{MODEL_CODE_AGI}</code> for most coding. Switch to <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{MODEL_GPT_CODEX}</code> when you need maximum capability for complex refactors or architectural work.
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
}
