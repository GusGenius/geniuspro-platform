"use client";

import { CollapsibleSection } from "@/components/docs/collapsible-section";

type Props = {
  icon: React.ComponentType<{ className?: string }>;
};

export function ApiReferenceSection({ icon: Icon }: Props) {
  return (
    <CollapsibleSection id="api-reference" title="API Reference" icon={Icon} defaultOpen={false}>
      <div className="space-y-3 sm:space-y-4">
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-5 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2 flex-wrap">
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] sm:text-xs font-medium rounded flex-shrink-0">POST</span>
            <code className="text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs sm:text-sm">/v1/chat/completions</code>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Create a chat completion. Supports streaming.</p>
        </div>

        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-5 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2 flex-wrap">
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-medium rounded flex-shrink-0">GET</span>
            <code className="text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs sm:text-sm">/v1/models</code>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">List available models.</p>
        </div>

        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-5 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2 flex-wrap">
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-medium rounded flex-shrink-0">GET</span>
            <code className="text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs sm:text-sm">/health</code>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Check API health status (no auth required).</p>
        </div>
      </div>
    </CollapsibleSection>
  );
}

