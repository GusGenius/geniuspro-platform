"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { getGreeting } from "@/lib/utils";
import { Orb } from "@/components/orb/Orb";

export default function DashboardPage() {
  const { user } = useAuth();
  const greeting = getGreeting();

  // Get first name from email or use "there"
  const firstName = user?.email?.split("@")[0] || "there";
  const displayName =
    firstName.charAt(0).toUpperCase() + firstName.slice(1);

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
        <h1 className="text-3xl md:text-4xl font-light text-gray-600 dark:text-gray-300 tracking-tight">
          {greeting}, {displayName}
        </h1>
      </div>

      <p className="mt-3 text-sm text-gray-400 dark:text-gray-500 welcome-fade-in-delay-2">
        Your workers are standing by.
      </p>
    </div>
  );
}
