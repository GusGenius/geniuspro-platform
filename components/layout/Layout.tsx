"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import SidebarProvider from "./SidebarContext";
import Header from "./Header";
import { useAuth } from "@/lib/auth/auth-context";

interface LayoutProps {
  children: ReactNode;
}

// Routes that require login
const protectedRoutes = ["/api-keys", "/usage", "/billing"];
// Routes that render without the app shell
const bareRoutes = ["/login", "/auth/handoff"];

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!loading && !user && protectedRoutes.includes(pathname || "")) {
      router.push("/login");
    }
  }, [loading, user, pathname, router]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Bare pages (no sidebar/header)
  if (bareRoutes.includes(pathname || "")) {
    return <>{children}</>;
  }

  // Protected pages — show loading while checking auth
  if (protectedRoutes.includes(pathname || "") && (loading || !user)) {
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
          className="flex-1 flex flex-col transition-all duration-300"
          style={{ marginLeft: "var(--sidebar-width, 0px)" }}
        >
          {!isMobile && <Header />}
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900 pt-14 md:pt-10">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
