"use client";

type Props = {
  icon: React.ComponentType<{ className?: string }>;
};

export function RateLimitsSection({ icon: Icon }: Props) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-400" />
        Rate Limits
      </h2>

      <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          By default, API keys have a rate limit of{" "}
          <strong className="text-gray-900 dark:text-white">120 requests per minute (RPM)</strong>.
          This limit applies per API key and helps ensure fair usage across all users.
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
          Rate limits can be adjusted for Pro and Enterprise plans. Contact support for custom rate limits.
        </p>
      </div>
    </section>
  );
}

