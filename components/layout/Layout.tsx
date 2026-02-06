"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import SidebarProvider from "./SidebarContext";
import { PanelStateProvider, usePanelState } from "./PanelStateContext";
import Header from "./Header";
import ChatPanel from "../panels/ChatPanel";
import AgentsPanel from "../panels/AgentsPanel";
import { useAuth } from "@/lib/auth/auth-context";

interface LayoutProps {
  children: ReactNode;
}

const publicRoutes = ["/", "/login"];

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user && !publicRoutes.includes(pathname || "")) {
      router.push("/login");
    }
  }, [loading, user, pathname, router]);

  // Public pages
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Loading state
  if (loading || (!user && !publicRoutes.includes(pathname || ""))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <PanelStateProvider>
      <LayoutContent>{children}</LayoutContent>
    </PanelStateProvider>
  );
}

function LayoutContent({ children }: { children: ReactNode }) {
  const { panelState } = usePanelState();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);
  
  const rightPadding = (() => {
    if (isMobile) return 0;
    if (panelState.chatVisible && panelState.agentsVisible) {
      return panelState.chatWidth + panelState.agentsWidth;
    } else if (panelState.chatVisible) {
      return panelState.chatWidth;
    } else if (panelState.agentsVisible) {
      return panelState.agentsWidth;
    }
    return 0;
  })();

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar />
        <div 
          className="flex-1 flex flex-col transition-all duration-300" 
          style={{ 
            marginLeft: 'var(--sidebar-width, 0px)',
            paddingRight: `${rightPadding}px`
          }}
        >
          <div className="hidden md:block">
            <Header />
          </div>
          <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 pt-14 md:pt-10">
            {children}
          </main>
        </div>
        <div className="hidden md:block">
          <ChatPanel />
          <AgentsPanel />
        </div>
      </div>
    </SidebarProvider>
  );
}
