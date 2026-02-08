"use client";

import { Check, Copy } from "lucide-react";

type Props = {
  title: string;
  code: string;
  copyId: string;
  copiedCode: string | null;
  onCopy: (code: string, id: string) => void;
};

export function CodeExampleCard({ title, code, copyId, copiedCode, onCopy }: Props) {
  return (
    <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden max-w-full">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/50">
        <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">{title}</span>
        <button
          onClick={() => onCopy(code, copyId)}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
        >
          {copiedCode === copyId ? (
            <>
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
              <span className="text-green-500 dark:text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-hidden sm:overflow-x-auto">
        <pre className="p-3 sm:p-4 text-[11px] sm:text-sm bg-gray-50 dark:bg-gray-900/30 w-full">
          <code className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap sm:whitespace-pre break-words">
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}

