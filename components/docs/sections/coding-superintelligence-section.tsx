"use client";

import { CodeExampleCard } from "@/components/docs/code-example-card";
import {
  CURL_CODING_CHAT_EXAMPLE,
  CURL_CODING_ONBOARDING_EXAMPLE,
  CURL_CODING_SUMMARIZE_EXAMPLE,
  CURL_MEMORY_LIST_SNIPPETS_EXAMPLE,
  CURL_MEMORY_SAVE_SNIPPET_EXAMPLE,
} from "@/components/docs/docs-constants";

type Props = {
  icon: React.ComponentType<{ className?: string }>;
  copiedCode: string | null;
  onCopyCode: (code: string, id: string) => void;
};

export function CodingSuperintelligenceSection({ icon: Icon, copiedCode, onCopyCode }: Props) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-400" />
        Coding Superintelligence (Cursor)
      </h2>

      <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 mb-4">
        <p className="text-gray-600 dark:text-gray-300">
          These endpoints are optimized for Cursor coding workflows: onboarding, tool-based project discovery,
          code-aware routing, and developer-friendly summarization.
        </p>
        <ul className="list-disc pl-5 mt-3 text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>Start a new coding session with an onboarding question (no “hi” needed)</li>
          <li>Streaming supported (`stream: true`)</li>
          <li>Optional memory snippets API (user-approved only)</li>
        </ul>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <CodeExampleCard
          title="Onboarding (first call)"
          code={CURL_CODING_ONBOARDING_EXAMPLE}
          copyId="curl-coding-onboarding"
          copiedCode={copiedCode}
          onCopy={onCopyCode}
        />

        <CodeExampleCard
          title="Coding chat (streaming)"
          code={CURL_CODING_CHAT_EXAMPLE}
          copyId="curl-coding-chat"
          copiedCode={copiedCode}
          onCopy={onCopyCode}
        />

        <CodeExampleCard
          title="Summarize (diff/session/file_or_folder/selection)"
          code={CURL_CODING_SUMMARIZE_EXAMPLE}
          copyId="curl-coding-summarize"
          copiedCode={copiedCode}
          onCopy={onCopyCode}
        />

        <CodeExampleCard
          title="Save memory snippet (requires approved=true)"
          code={CURL_MEMORY_SAVE_SNIPPET_EXAMPLE}
          copyId="curl-memory-save"
          copiedCode={copiedCode}
          onCopy={onCopyCode}
        />

        <CodeExampleCard
          title="List memory snippets"
          code={CURL_MEMORY_LIST_SNIPPETS_EXAMPLE}
          copyId="curl-memory-list"
          copiedCode={copiedCode}
          onCopy={onCopyCode}
        />
      </div>
    </section>
  );
}

