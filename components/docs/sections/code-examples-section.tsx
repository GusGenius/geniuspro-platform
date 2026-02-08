"use client";

import { CodeExampleCard } from "@/components/docs/code-example-card";
import {
  CURL_SUPERINTELLIGENCE_EXAMPLE,
  JS_SUPERINTELLIGENCE_EXAMPLE,
  PYTHON_SUPERINTELLIGENCE_EXAMPLE,
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
        Code Examples (/v1)
      </h2>

      <div className="space-y-4 sm:space-y-6">
        <CodeExampleCard
          title="cURL"
          code={CURL_SUPERINTELLIGENCE_EXAMPLE}
          copyId="curl-si"
          copiedCode={copiedCode}
          onCopy={onCopyCode}
        />

        <CodeExampleCard
          title="Python"
          code={PYTHON_SUPERINTELLIGENCE_EXAMPLE}
          copyId="python-si"
          copiedCode={copiedCode}
          onCopy={onCopyCode}
        />

        <CodeExampleCard
          title="JavaScript / TypeScript"
          code={JS_SUPERINTELLIGENCE_EXAMPLE}
          copyId="js-si"
          copiedCode={copiedCode}
          onCopy={onCopyCode}
        />
      </div>
    </section>
  );
}

