"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function HandoffPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleHandoff = async () => {
      try {
        // Parse URL hash fragment
        const hash = window.location.hash.substring(1); // Remove leading #
        const params = new URLSearchParams(hash);
        
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const redirectPath = params.get("redirect") || "/dashboard";

        if (!accessToken || !refreshToken) {
          setStatus("error");
          setErrorMessage("Missing authentication tokens");
          setTimeout(() => {
            router.push("/login?error=handoff_failed");
          }, 2000);
          return;
        }

        // Set the session using Supabase
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setStatus("error");
          setErrorMessage(error.message);
          setTimeout(() => {
            router.push("/login?error=handoff_failed");
          }, 2000);
          return;
        }

        // Success - redirect to the intended page
        setStatus("success");
        router.push(redirectPath);
      } catch (error) {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
        setTimeout(() => {
          router.push("/login?error=handoff_failed");
        }, 2000);
      }
    };

    handleHandoff();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Signing you in...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-red-500 mb-4">
              <svg
                className="w-8 h-8 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-red-500 mb-2">Authentication failed</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{errorMessage}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Redirecting to login...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-green-500 mb-4">
              <svg
                className="w-8 h-8 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Successfully signed in!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
}
