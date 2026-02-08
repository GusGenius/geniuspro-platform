"use client";

import { CodeExampleCard } from "@/components/docs/code-example-card";
import {
  CURL_OPENAI_COMPAT_EXAMPLE,
  JS_OPENAI_COMPAT_EXAMPLE,
  PYTHON_OPENAI_COMPAT_EXAMPLE,
} from "@/components/docs/docs-constants";

type Props = {
  icon: React.ComponentType<{ className?: string }>;
  copiedCode: string | null;
  onCopyCode: (code: string, id: string) => void;
};

export function CodeExamplesSection({ icon: Icon, copiedCode, onCopyCode }: Props) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-400" />
        Code Examples (OpenAI-compatible)
      </h2>

      <div className="space-y-4 sm:space-y-6">
        <CodeExampleCard
          title="cURL"
          code={CURL_OPENAI_COMPAT_EXAMPLE}
          copyId="curl-openai"
          copiedCode={copiedCode}
          onCopy={onCopyCode}
        />

        <CodeExampleCard
          title="Python"
          code={PYTHON_OPENAI_COMPAT_EXAMPLE}
          copyId="python-openai"
          copiedCode={copiedCode}
          onCopy={onCopyCode}
        />

        <CodeExampleCard
          title="JavaScript / TypeScript"
          code={JS_OPENAI_COMPAT_EXAMPLE}
          copyId="js-openai"
          copiedCode={copiedCode}
          onCopy={onCopyCode}
        />
      </div>
    </section>
  );
}

