"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function CatDetailSkeleton() {
  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-4 w-12 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
                >
                  <div className="flex gap-3 mb-3">
                    <Skeleton className="h-10 w-32 rounded-lg" />
                    <Skeleton className="h-10 flex-1 rounded-lg" />
                  </div>
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
