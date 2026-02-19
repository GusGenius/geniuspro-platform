"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function LayoutSkeleton() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div
        className="flex flex-col border-r border-gray-200 dark:border-gray-800"
        style={{ width: "var(--sidebar-width, 256px)" }}
      >
        <Skeleton className="h-14 w-full rounded-none" />
        <div className="flex-1 p-3 space-y-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <Skeleton className="h-10 w-full rounded-none hidden md:block" />
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
