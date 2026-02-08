"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Key,
  BarChart3,
  BookOpen,
  CreditCard,
  MessageSquare,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  applyThemeToDOM,
  getStoredTheme,
  setStoredTheme,
  THEME_CHANGE_EVENT,
  type Theme,
} from "@/lib/theme/theme";

export default function Sidebar() {
  const { isExpanded, setIsExpanded } = useSidebar();
  const [theme, setTheme] = useState<Theme>("dark");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const handleChatClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token && session?.refresh_token) {
        const handoffUrl =
          `https://chat.geniuspro.io/auth/handoff#access_token=${encodeURIComponent(session.access_token)}` +
          `&refresh_token=${encodeURIComponent(session.refresh_token)}` +
          `&redirect=${encodeURIComponent("/dashboard")}`;
        window.open(handoffUrl, "_blank", "noopener,noreferrer");
        return;
      }

      window.open("https://chat.geniuspro.io", "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to get session for chat handoff:", error);
      window.open("https://chat.geniuspro.io", "_blank", "noopener,noreferrer");
    }
  };

  useEffect(() => {
    const apply = () => {
      const stored = getStoredTheme();
      const next: Theme = stored ?? "dark";
      setTheme(next);
      applyThemeToDOM(next);
    };

    apply();

    const onChanged = () => apply();
    window.addEventListener(THEME_CHANGE_EVENT, onChanged);
    window.addEventListener("storage", onChanged);
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, onChanged);
      window.removeEventListener("storage", onChanged);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleMouseEnter = () => {
    setIsExpanded(true);
    document.documentElement.style.setProperty("--sidebar-width", "200px");
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
    document.documentElement.style.setProperty("--sidebar-width", "60px");
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    setStoredTheme(newTheme);
    applyThemeToDOM(newTheme);
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Chat", href: "https://chat.geniuspro.io", icon: MessageSquare, external: true, handoff: true },
    { name: "API Keys", href: "/api-keys", icon: Key },
    { name: "Docs", href: "/docs", icon: BookOpen },
    { name: "Usage", href: "/usage", icon: BarChart3 },
    { name: "Billing", href: "/billing", icon: CreditCard },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href.startsWith("http")) return false;
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile navigation */}
      <div className="md:hidden">
        <div className="fixed top-0 left-0 right-0 z-40 h-14 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-3">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo.avif"
              alt="GeniusPro Logo"
              width={100}
              height={36}
              className="object-contain"
              priority
            />
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <aside className="fixed right-0 top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex h-14 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Menu
                </h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {user?.email && (
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              )}

              <nav className="flex-1 overflow-y-auto py-3 px-2">
                <ul className="space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    const cls = `flex items-center py-3 px-3 rounded-lg transition-all duration-300 min-h-[44px] ${
                      active
                        ? "bg-blue-500/15 text-blue-400 border-r-2 border-blue-400"
                        : "text-gray-500 dark:text-gray-400 hover:bg-blue-500/20 hover:text-gray-900 dark:hover:text-white"
                    }`;
                    return (
                      <li key={item.name}>
                        {"handoff" in item && item.handoff ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              handleChatClick(e);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`${cls} w-full`}
                          >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium ml-3">
                              {item.name}
                            </span>
                          </button>
                        ) : "external" in item && item.external ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cls}
                          >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium ml-3">
                              {item.name}
                            </span>
                          </a>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cls}
                          >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium ml-3">
                              {item.name}
                            </span>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="border-t border-gray-200 dark:border-gray-700 flex-shrink-0 p-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={toggleTheme}
                    className="flex flex-col items-center justify-center py-3 px-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-blue-500/20 hover:text-gray-900 dark:hover:text-white transition-all min-h-[44px]"
                  >
                    {theme === "dark" ? (
                      <Sun className="w-5 h-5 mb-1" />
                    ) : (
                      <Moon className="w-5 h-5 mb-1" />
                    )}
                    <span className="text-xs font-medium">
                      {theme === "dark" ? "Light" : "Dark"}
                    </span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center py-3 px-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-blue-500/20 hover:text-gray-900 dark:hover:text-white transition-all min-h-[44px]"
                  >
                    <LogOut className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </aside>
          </>
        )}
      </div>

      {/* Desktop navigation */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen bg-white dark:bg-gray-900 transition-all duration-300 ${
          isExpanded ? "w-[200px]" : "w-[60px]"
        } flex-col border-r border-gray-200 dark:border-gray-700 overflow-hidden hidden md:flex`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
      {/* Logo */}
      <div
        className={`flex h-16 items-center border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isExpanded ? "justify-start px-4" : "justify-center px-0"
        }`}
      >
        <Image
          src="/logo.avif"
          alt="GeniusPro Logo"
          width={isExpanded ? 140 : 40}
          height={isExpanded ? 50 : 40}
          className="object-contain"
          priority
        />
      </div>

      {/* Navigation */}
      <nav
        className={`flex-1 overflow-y-auto py-4 transition-all duration-300 ${
          isExpanded ? "px-2" : "px-0"
        }`}
      >
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const cls = `flex items-center py-2.5 rounded-lg transition-all duration-300 ${
              isExpanded ? "px-3 gap-3" : "px-0 justify-center gap-0"
            } ${
              active
                ? "bg-blue-500/15 text-blue-400 border-l-2 border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:bg-blue-500/20 hover:text-gray-900 dark:hover:text-white"
            }`;
            const label = (
              <span
                className={`text-sm font-medium transition-all duration-300 whitespace-nowrap overflow-hidden ${
                  isExpanded ? "opacity-100 w-auto" : "w-0 opacity-0"
                }`}
              >
                {item.name}
              </span>
            );
            return (
              <li key={item.name}>
                {"handoff" in item && item.handoff ? (
                  <button
                    type="button"
                    onClick={handleChatClick}
                    className={`${cls} w-full`}
                    title={!isExpanded ? item.name : ""}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {label}
                  </button>
                ) : "external" in item && item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cls}
                    title={!isExpanded ? item.name : ""}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {label}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className={cls}
                    title={!isExpanded ? item.name : ""}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div
        className={`border-t border-gray-200 dark:border-gray-700 transition-all duration-300 flex-shrink-0 mt-auto py-4 ${
          isExpanded ? "px-2" : "px-0"
        }`}
      >
        <button
          onClick={handleLogout}
          className={`flex items-center py-2.5 rounded-lg w-full text-gray-500 dark:text-gray-400 hover:bg-blue-500/20 hover:text-gray-900 dark:hover:text-white transition-all duration-300 ${
            isExpanded ? "px-3 gap-3" : "px-0 justify-center gap-0"
          }`}
          title={!isExpanded ? "Logout" : ""}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span
            className={`text-sm font-medium transition-all duration-300 whitespace-nowrap overflow-hidden ${
              isExpanded ? "opacity-100 w-auto" : "w-0 opacity-0"
            }`}
          >
            Logout
          </span>
        </button>
      </div>
      </aside>
    </>
  );
}
