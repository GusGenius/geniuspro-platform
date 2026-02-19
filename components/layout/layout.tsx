"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./sidebar";
import SidebarProvider from "./sidebar-context";
import Header from "./header";
import { useAuth } from "@/lib/auth/auth-context";
import { LayoutSkeleton } from "./layout-skeleton";

interface LayoutProps {
  children: ReactNode;
}

// Public pages that must render without an existing session.
// IMPORTANT: `/auth/handoff` needs to run unauthenticated so it can accept
// tokens from the other app and call `supabase.auth.setSession(...)`.
const publicRoutePrefixes = ["/login", "/auth/handoff"];

function isPublicRoute(pathname: string | null): boolean {
  const p = pathname ?? "";
  return publicRoutePrefixes.some((prefix) => p === prefix || p.startsWith(prefix + "/"));
}

function isDevSkipAuth(): boolean {
  if (typeof window === "undefined") return false;
  return (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === "true" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  );
}

function buildLoginUrl(currentPath: string): string {
  return `/login?redirect=${encodeURIComponent(currentPath)}`;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isDevSkipAuth()) return;
    if (!loading && !user && !isPublicRoute(pathname)) {
      router.push(buildLoginUrl(pathname ?? "/"));
    }
  }, [loading, user, pathname, router]);

  // Bare pages (no sidebar/header)
  if (isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  // Avoid hydration mismatch: only check isDevSkipAuth after mount (uses window)
  if (!mounted) {
    return <LayoutSkeleton />;
  }

  // Dev bypass: allow viewing without auth on localhost when NEXT_PUBLIC_DEV_SKIP_AUTH=true
  if (isDevSkipAuth()) {
    return (
      <SidebarProvider>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
          <Sidebar />
          <div
            className="flex-1 flex flex-col transition-all duration-300 w-full min-w-0"
            style={{ paddingLeft: "var(--sidebar-width, 0px)" }}
          >
            <div className="hidden md:block">
              <Header />
            </div>
            <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900 pt-14 md:pt-10">
              <div className="p-4 bg-amber-500/10 border-b border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm">
                Dev mode: auth bypassed (NEXT_PUBLIC_DEV_SKIP_AUTH=true)
              </div>
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Protected pages — show loading while checking auth
  if (loading || !user) {
    return <LayoutSkeleton />;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar />
        <div
          className="flex-1 flex flex-col transition-all duration-300 w-full min-w-0"
          style={{ paddingLeft: "var(--sidebar-width, 0px)" }}
        >
          <div className="hidden md:block">
            <Header />
          </div>
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900 pt-14 md:pt-10">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
