"use client";

import { TabbedCodeBlock } from "@/components/docs/tabbed-code-block";
import { CollapsibleSection } from "@/components/docs/collapsible-section";
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
    <CollapsibleSection
      id="code-examples"
      title="Code Examples"
      icon={Icon}
      description={
        <>
          Ready-to-run examples using the Superintelligence endpoint. Replace{" "}
          <code className="text-xs bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">
            YOUR_API_KEY
          </code>{" "}
          with your key.
        </>
      }
    >
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
    </CollapsibleSection>
  );
}
