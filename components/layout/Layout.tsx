"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import SidebarProvider from "./SidebarContext";
import Header from "./Header";
import { useAuth } from "@/lib/auth/auth-context";
import { LayoutSkeleton } from "./LayoutSkeleton";

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

function buildLoginUrl(currentPath: string): string {
  return `/login?redirect=${encodeURIComponent(currentPath)}`;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user && !isPublicRoute(pathname)) {
      router.push(buildLoginUrl(pathname ?? "/"));
    }
  }, [loading, user, pathname, router]);

  // Bare pages (no sidebar/header)
  if (isPublicRoute(pathname)) {
    return <>{children}</>;
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
