"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function LoginSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="p-4 md:p-6">
        <Skeleton className="h-[52px] w-[52px] rounded-lg" />
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center">
            <Skeleton className="h-16 w-44 rounded" />
          </div>
          <div className="bg-gray-800/90 backdrop-blur-md border border-gray-700/50 rounded-xl p-8 space-y-6">
            <Skeleton className="h-6 w-48 mx-auto" />
            <div className="space-y-5">
              <div>
                <Skeleton className="h-4 w-12 mb-2" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
