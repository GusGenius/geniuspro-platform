"use client";

import { Check, Copy } from "lucide-react";
import { CollapsibleSection } from "@/components/docs/collapsible-section";
import { AUTH_HEADER_EXAMPLE } from "@/components/docs/docs-constants";

type Props = {
  icon: React.ComponentType<{ className?: string }>;
  copiedText: string | null;
  onCopyText: (text: string, id: string) => void;
};

export function AuthenticationSection({ icon: Icon, copiedText, onCopyText }: Props) {
  return (
    <CollapsibleSection
      id="authentication"
      title="Authentication"
      icon={Icon}
      description="Every request requires your API key in the header."
      defaultOpen={false}
    >
      <div className="mb-6">
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Key management</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Manage keys at{" "}
          <a
            href="/api-keys"
            className="text-blue-500 dark:text-blue-400 underline underline-offset-2 hover:text-blue-600"
          >
            API Keys
          </a>
          . You can create new keys, regenerate a key (invalidates the old one and shows the new key once), or delete keys. Keys are shown only once when created or regenerated—store them securely.
        </p>
      </div>

      <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6">
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
          Add this header to all requests:
        </p>

        <div className="bg-gray-200 dark:bg-gray-900 rounded-lg p-3 sm:p-4 font-mono text-sm relative group overflow-x-auto">
          <button
            onClick={() => onCopyText(AUTH_HEADER_EXAMPLE, "auth-header")}
            className="absolute top-2 right-2 p-1.5 rounded hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex-shrink-0"
            title="Copy authorization header"
          >
            {copiedText === "auth-header" ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <div className="pr-8">
            <span className="text-gray-400 dark:text-gray-500">Authorization:</span>{" "}
            <span className="text-green-600 dark:text-green-400">Bearer</span>{" "}
            <span className="text-blue-500 dark:text-blue-400">YOUR_API_KEY</span>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}

