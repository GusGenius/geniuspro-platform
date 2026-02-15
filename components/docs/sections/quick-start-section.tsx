"use client";

import { Check, Copy, Key, ArrowRight } from "lucide-react";

import {
  API_BASE_URL,
  MODEL_AGI,
  MODEL_CODE_AGI,
  MODEL_GPT_CODEX,
} from "@/components/docs/docs-constants";
import { CollapsibleSection } from "@/components/docs/collapsible-section";

type Props = {
  icon: React.ComponentType<{ className?: string }>;
  copiedText: string | null;
  onCopyText: (text: string, id: string) => void;
};

function CopyChip({
  value,
  id,
  copiedText,
  onCopy,
  color = "blue",
}: {
  value: string;
  id: string;
  copiedText: string | null;
  onCopy: (t: string, id: string) => void;
  color?: "blue" | "green";
}) {
  const colorClasses =
    color === "green"
      ? "text-green-600 dark:text-green-400"
      : "text-blue-500 dark:text-blue-400";
  return (
    <span className="inline-flex items-center gap-1.5 bg-gray-200 dark:bg-gray-900 rounded-lg px-2.5 py-1 group">
      <code className={`font-mono text-sm ${colorClasses} break-all`}>
        {value}
      </code>
      <button
        onClick={() => onCopy(value, id)}
        className="p-0.5 rounded hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-white flex-shrink-0"
        title="Copy"
      >
        {copiedText === id ? (
          <Check className="w-3.5 h-3.5 text-green-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </span>
  );
}

export function QuickStartSection({
  icon: Icon,
  copiedText,
  onCopyText,
}: Props) {
  return (
    <CollapsibleSection
      id="quick-start"
      title="Quick Start"
      icon={Icon}
      description="Get up and running in three steps."
      defaultOpen={true}
    >
      {/* Step 1 */}
      <div className="relative pl-8 pb-8 border-l-2 border-gray-200 dark:border-gray-700">
        <div className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
          1
        </div>
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
          Get your API key
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Go to{" "}
          <a
            href="/api-keys"
            className="text-blue-500 dark:text-blue-400 underline underline-offset-2 hover:text-blue-600"
          >
            API Keys
          </a>{" "}
          to create a key. You&apos;ll use it in the{" "}
          <code className="text-xs bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">
            Authorization
          </code>{" "}
          header for every request.
        </p>
        <div className="bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 inline-flex items-center gap-2">
          <Key className="w-4 h-4 text-gray-400" />
          <code className="text-sm text-gray-600 dark:text-gray-300">
            Authorization: Bearer{" "}
            <span className="text-blue-500 dark:text-blue-400">
              YOUR_API_KEY
            </span>
          </code>
        </div>
      </div>

      {/* Step 2 */}
      <div className="relative pl-8 pb-8 border-l-2 border-gray-200 dark:border-gray-700">
        <div className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
          2
        </div>
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
          Choose your endpoint
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Pick the right base URL and model for your use case:
        </p>

        <div className="space-y-3">
          {/* Unified API (geniuspro-api) */}
          <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Chat API (OpenAI-compatible)
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                Recommended
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Our chat model. Use with Cursor, OpenAI SDK, or any OpenAI-compatible client.
            </p>
            <div className="flex flex-wrap gap-2">
              <CopyChip
                value={API_BASE_URL}
                id="base-url-api"
                copiedText={copiedText}
                onCopy={onCopyText}
              />
              <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 self-center flex-shrink-0" />
              <CopyChip
                value={MODEL_AGI}
                id="model-agi"
                copiedText={copiedText}
                onCopy={onCopyText}
                color="green"
              />
            </div>
          </div>

          {/* Coding */}
          <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Coding (Cursor)
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Our coding model. Same base URL as chat.
            </p>
            <div className="flex flex-wrap gap-2">
              <CopyChip
                value={API_BASE_URL}
                id="base-url-coding"
                copiedText={copiedText}
                onCopy={onCopyText}
              />
              <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 self-center flex-shrink-0" />
              <CopyChip
                value={MODEL_CODE_AGI}
                id="model-coding"
                copiedText={copiedText}
                onCopy={onCopyText}
                color="green"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="relative pl-8">
        <div className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
          3
        </div>
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
          Make your first request
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Jump to{" "}
          <button
            onClick={() =>
              document
                .getElementById("code-examples")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className="text-blue-500 dark:text-blue-400 underline underline-offset-2 hover:text-blue-600"
          >
            Code Examples
          </button>{" "}
          below for ready-to-run cURL, Python, and JavaScript snippets.
        </p>
      </div>
    </CollapsibleSection>
  );
}
