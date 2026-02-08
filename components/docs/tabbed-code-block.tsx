"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Tab = {
  label: string;
  code: string;
  copyId: string;
};

type Props = {
  tabs: Tab[];
  copiedCode: string | null;
  onCopy: (code: string, id: string) => void;
};

export function TabbedCodeBlock({ tabs, copiedCode, onCopy }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = tabs[activeIdx];

  return (
    <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden max-w-full">
      {/* Tab bar + copy button */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/50">
        <div className="flex">
          {tabs.map((tab, idx) => (
            <button
              key={tab.copyId}
              onClick={() => setActiveIdx(idx)}
              className={`
                px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors relative
                ${
                  idx === activeIdx
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }
              `}
            >
              {tab.label}
              {idx === activeIdx && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400" />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => onCopy(active.code, active.copyId)}
          className="flex items-center gap-1.5 px-3 py-1.5 mr-2 rounded-lg text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
        >
          {copiedCode === active.copyId ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-500 dark:text-green-400">
                Copied!
              </span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <div className="overflow-x-auto">
        <pre className="p-3 sm:p-4 text-[11px] sm:text-sm bg-gray-50 dark:bg-gray-900/30 w-full">
          <code className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap sm:whitespace-pre break-words">
            {active.code}
          </code>
        </pre>
      </div>
    </div>
  );
}
