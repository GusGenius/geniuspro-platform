"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import SidebarProvider from "./SidebarContext";
import Header from "./Header";
import { useAuth } from "@/lib/auth/auth-context";

interface LayoutProps {
  children: ReactNode;
}

// Routes that require login (prefix match: protects nested routes too)
const protectedRoutePrefixes = ["/api-keys", "/cats", "/swarms", "/usage", "/billing"];
// Routes that render without the app shell
const bareRoutes = ["/login", "/auth/handoff"];

function isProtectedRoute(pathname: string | null): boolean {
  const p = pathname ?? "";
  return protectedRoutePrefixes.some((prefix) => p === prefix || p.startsWith(prefix + "/"));
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user && isProtectedRoute(pathname)) {
      router.push("/login");
    }
  }, [loading, user, pathname, router]);

  // Bare pages (no sidebar/header)
  if (bareRoutes.includes(pathname || "")) {
    return <>{children}</>;
  }

  // Protected pages — show loading while checking auth
  if (isProtectedRoute(pathname) && (loading || !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
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
