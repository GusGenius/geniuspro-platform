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

export function CodingSuperintelligenceSection({
  icon: Icon,
  copiedCode,
  onCopyCode,
}: Props) {
  return (
    <section id="coding-superintelligence" className="mb-12 scroll-mt-24">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-400" />
        Coding Superintelligence
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
        Endpoints optimized for Cursor coding workflows.
      </p>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          "Tool-based project discovery",
          "Streaming support",
          "Diff summarization",
          "Memory snippets API",
        ].map((feat) => (
          <span
            key={feat}
            className="px-3 py-1 text-xs font-medium rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40"
          >
            {feat}
          </span>
        ))}
      </div>

      {/* Endpoints — collapsible-style cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            1. Start a session (onboarding)
          </h3>
          <CodeExampleCard
            title="POST /chat/completions — empty messages"
            code={CURL_CODING_ONBOARDING_EXAMPLE}
            copyId="curl-coding-onboarding"
            copiedCode={copiedCode}
            onCopy={onCopyCode}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            2. Coding chat (streaming)
          </h3>
          <CodeExampleCard
            title="POST /chat/completions — with stream: true"
            code={CURL_CODING_CHAT_EXAMPLE}
            copyId="curl-coding-chat"
            copiedCode={copiedCode}
            onCopy={onCopyCode}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            3. Summarize content
          </h3>
          <CodeExampleCard
            title="POST /summarize — diff, session, file, or selection"
            code={CURL_CODING_SUMMARIZE_EXAMPLE}
            copyId="curl-coding-summarize"
            copiedCode={copiedCode}
            onCopy={onCopyCode}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            4. Memory snippets
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Save and retrieve user-approved code snippets across sessions.
          </p>
          <div className="space-y-3">
            <CodeExampleCard
              title="POST /memory/snippets — save (requires approved: true)"
              code={CURL_MEMORY_SAVE_SNIPPET_EXAMPLE}
              copyId="curl-memory-save"
              copiedCode={copiedCode}
              onCopy={onCopyCode}
            />
            <CodeExampleCard
              title="GET /memory/snippets — list"
              code={CURL_MEMORY_LIST_SNIPPETS_EXAMPLE}
              copyId="curl-memory-list"
              copiedCode={copiedCode}
              onCopy={onCopyCode}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
