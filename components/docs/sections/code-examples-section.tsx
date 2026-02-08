"use client";

import { TabbedCodeBlock } from "@/components/docs/tabbed-code-block";
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

export function CodeExamplesSection({
  icon: Icon,
  copiedCode,
  onCopyCode,
}: Props) {
  return (
    <section id="code-examples" className="mb-12 scroll-mt-24">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-400" />
        Code Examples
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
        Ready-to-run examples using the Superintelligence endpoint. Replace{" "}
        <code className="text-xs bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">
          YOUR_API_KEY
        </code>{" "}
        with your key.
      </p>

      <TabbedCodeBlock
        tabs={[
          {
            label: "cURL",
            code: CURL_SUPERINTELLIGENCE_EXAMPLE,
            copyId: "curl-si",
          },
          {
            label: "Python",
            code: PYTHON_SUPERINTELLIGENCE_EXAMPLE,
            copyId: "python-si",
          },
          {
            label: "JavaScript",
            code: JS_SUPERINTELLIGENCE_EXAMPLE,
            copyId: "js-si",
          },
        ]}
        copiedCode={copiedCode}
        onCopy={onCopyCode}
      />
    </section>
  );
}
