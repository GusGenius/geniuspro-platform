"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loader2, Mail, Lock } from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";
import { Grid3D } from "@/components/ui/grid3d";
import { LoginSkeleton } from "@/components/auth/login-skeleton";

function sanitizeRedirect(raw: string | null): string | null {
  if (!raw) return null;
  // Prevent open-redirects: allow only same-origin absolute paths.
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//")) return null;
  if (raw.includes("://")) return null;
  return raw;
}

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = sanitizeRedirect(searchParams.get("redirect")) ?? "/dashboard";

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        router.push(redirectTo);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoginSkeleton />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Perspective Grid Background */}
      <Grid3D
        gridColor="rgba(100, 180, 255, 0.35)"
        glowColor="rgba(100, 180, 255, 0.2)"
        horizonPosition={0.4}
      />

      {/* Header - Cat top left like landing page */}
      <header className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center z-30">
        <a href="/" aria-label="GeniusPro Home" className="inline-flex items-center">
          <Image
            src="/geniuspro-cat.svg"
            alt="GeniusPro"
            width={52}
            height={52}
            className="object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]"
            priority
          />
        </a>
      </header>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <Image
              src="/logo.avif"
              alt="GeniusPro Logo"
              width={180}
              height={65}
              className="object-contain"
              priority
            />
          </div>

          {/* Login Card */}
          <div className="bg-gray-800/90 backdrop-blur-md border border-gray-700/50 rounded-xl p-8 shadow-xl">
            <h2 className="text-xl font-semibold text-white text-center mb-6">
              Sign in to your account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="text-center text-gray-400 text-sm mt-6">
              Use your GeniusPro account to sign in.
            </p>
            <p className="text-center text-gray-500 text-xs mt-2">
              Access is invite-only. Contact admin for an account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

