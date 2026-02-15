"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { PRICING_ROWS } from "@/components/docs/pricing-data";

export default function PricingPage() {
  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Pricing
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Per 1M tokens (input/output) unless noted. Voice: per minute.
          </p>
        </div>

        <div className="space-y-3 sm:hidden">
          {PRICING_ROWS.map((row) => (
            <div
              key={row.model}
              className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3"
            >
              <code
                className={`${row.color} bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px] break-all inline-block`}
              >
                {row.model}
              </code>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                {row.input !== "—" && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Input:</span>{" "}
                    <span className="text-gray-600 dark:text-gray-300">{row.input}/1M</span>
                  </div>
                )}
                {row.output !== "—" && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Output:</span>{" "}
                    <span className="text-gray-600 dark:text-gray-300">{row.output}/1M</span>
                  </div>
                )}
                {row.other && row.input === "—" && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Per minute:</span>{" "}
                    <span className="text-gray-600 dark:text-gray-300">{row.other}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="hidden sm:block bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/50">
                <th className="px-4 lg:px-6 py-4 font-medium">Model</th>
                <th className="px-4 lg:px-6 py-4 font-medium whitespace-nowrap">Input (per 1M)</th>
                <th className="px-4 lg:px-6 py-4 font-medium whitespace-nowrap">Output (per 1M)</th>
                <th className="px-4 lg:px-6 py-4 font-medium">Other</th>
              </tr>
            </thead>
            <tbody>
              {PRICING_ROWS.map((row) => (
                <tr
                  key={row.model}
                  className="border-b border-gray-200/50 dark:border-gray-700/50 last:border-b-0 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-4 lg:px-6 py-4">
                    <code
                      className={`${row.color} bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap`}
                    >
                      {row.model}
                    </code>
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">{row.input}</td>
                  <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">{row.output}</td>
                  <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">
                    {row.other ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Pay-as-you-go
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            GeniusPro API uses pay-as-you-go pricing. You only pay for what you use. Credits can be purchased and will be automatically deducted as you make API requests.
          </p>
          <Link
            href="/billing"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            Manage billing & add credits
          </Link>
        </div>
      </div>
    </div>
  );
}
