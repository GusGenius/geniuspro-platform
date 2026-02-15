"use client";

import { MODEL_AGI, MODEL_CODE_AGI } from "@/components/docs/docs-constants";

type Props = {
  icon: React.ComponentType<{ className?: string }>;
};

export function GeniusProModelsSection({ icon: Icon }: Props) {
  return (
    <section id="geniuspro-models" className="mb-12 scroll-mt-24">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-400" />
        GeniusPro Models
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <code className="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">{MODEL_AGI}</code> (chat) and <code className="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">{MODEL_CODE_AGI}</code> (coding) are our flagship models. Use them with any OpenAI-compatible client.
      </p>

      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Models</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 mb-4 space-y-1">
            <li><code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{MODEL_AGI}</code> — Chat model for general conversation, summarization, and analysis.</li>
            <li><code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{MODEL_CODE_AGI}</code> — Coding model optimized for Cursor, Composer, and code generation.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Other models</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            You can also use any model from the <a href="#available-models" className="text-blue-500 dark:text-blue-400 underline underline-offset-2">Available Models</a> list (e.g. <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">claude-sonnet-4.5</code>, <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">gpt-5.3-codex</code>) by setting <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">model</code> in your request.
          </p>
        </div>
      </div>
    </section>
  );
}
