"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getGreeting } from "@/lib/utils";
import { Orb } from "@/components/orb/Orb";
import { ArrowRight, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const greeting = getGreeting();
  const router = useRouter();
  const [isGoingToApis, setIsGoingToApis] = useState(false);

  // Get first name from email or use "there"
  const firstName = user?.email?.split("@")[0] || "there";
  const displayName =
    firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const handleGoToApis = async () => {
    setIsGoingToApis(true);
    try {
      router.push("/api-keys");
    } finally {
      // Small delay so the button state is visible on click/tap
      setTimeout(() => setIsGoingToApis(false), 150);
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center -mt-10">
      {/* Orb - Center of the universe */}
      <div className="welcome-fade-in">
        <div className="orb-breathe">
          <Orb size="large" />
        </div>
      </div>

      {/* Welcome text beneath the orb */}
      <div className="mt-6 text-center welcome-fade-in-delay">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-light text-gray-600 dark:text-gray-300 tracking-tight">
            {greeting}, {displayName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You’re awesome. What are we building today?
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-4 welcome-fade-in-delay-2 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Your superintelligence is standing by.
        </p>
        <button
          type="button"
          onClick={() => {
            handleGoToApis().catch(() => {
              // no-op
            });
          }}
          disabled={isGoingToApis}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-500/20 dark:bg-blue-500/40 text-blue-600 dark:text-blue-400 font-medium transition-all hover:bg-blue-500/30 dark:hover:bg-blue-500/50 hover:shadow-[0_4px_12px_rgba(59,130,246,0.2)] focus:outline-none focus:shadow-[0_0_0_2px_rgb(59,130,246),0_0_0_4px_rgba(59,130,246,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGoingToApis ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Opening...
            </>
          ) : (
            <>
              Your APIs
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
