"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth/auth-context";
import { Grid3D } from "@/components/ui/grid3d";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Perspective Grid Background */}
      <Grid3D 
        gridColor="rgba(100, 180, 255, 0.35)"
        glowColor="rgba(100, 180, 255, 0.2)"
        horizonPosition={0.4}
      />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-end items-center z-20">
        {loading ? (
          <div className="text-white/50 text-xs md:text-sm">Loading...</div>
        ) : user ? (
          <Link
            href="/dashboard"
            className="text-white/80 font-medium hover:text-white transition-colors text-sm md:text-base"
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-white/80 font-medium hover:text-white transition-colors text-sm md:text-base"
          >
            Sign In
          </Link>
        )}
      </header>

      {/* Main Content */}
      {!user && (
        <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8 md:py-0">
          {/* Logo */}
          <div className="mb-6 md:mb-8 w-full max-w-[90vw] md:max-w-none">
            <Image
              src="/logo.avif"
              alt="GeniusPro Logo"
              width={400}
              height={133}
              className="brightness-0 invert w-full h-auto max-w-[280px] md:max-w-[400px] mx-auto"
              priority
              unoptimized
            />
          </div>

          {/* Alpha Badge */}
          <div className="mb-6 md:mb-8">
            <span className="inline-block px-4 py-1.5 text-xs md:text-sm font-medium tracking-widest uppercase text-blue-400 border border-blue-400/30 rounded-full bg-blue-400/5 backdrop-blur-sm">
              AGI &middot; Alpha
            </span>
          </div>
          
          {/* Headline */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-4 md:mb-6 px-2 leading-tight">
            Your Digital Workforce<br className="hidden md:block" /> Has Arrived
          </h1>
          
          {/* Subheadline */}
          <p className="text-white/60 text-base md:text-xl text-center max-w-2xl mb-10 md:mb-14 leading-relaxed px-4">
            Advanced intelligence that codes, speaks, and thinks &mdash; ready to deploy.
          </p>

          {/* CTA Button */}
          <Link
            href="/login"
            className="group relative px-10 py-4 bg-white text-black font-semibold text-base md:text-lg rounded-lg transition-all duration-300 hover:bg-blue-500 hover:text-white hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 active:translate-y-0"
          >
            Launch Your Workers
          </Link>

          {/* Footer tagline */}
          <p className="mt-12 md:mt-16 text-white/30 text-xs md:text-sm tracking-wide">
            Code &middot; Voice &middot; Agents &middot; API
          </p>
        </main>
      )}
      {/* Footer */}
      {!user && (
        <footer className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-center text-white/25 text-xs z-10">
          &copy; {new Date().getFullYear()} GeniusPro. All rights reserved.
        </footer>
      )}
    </div>
  );
}
