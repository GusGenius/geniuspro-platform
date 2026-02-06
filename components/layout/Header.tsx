"use client";

import { useState, useRef, useEffect } from "react";
import { usePanelState } from "./PanelStateContext";
import { Sun, Moon } from "lucide-react";

export default function Header() {
  const { panelState, toggleChat, toggleAgents } = usePanelState();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("platform-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    } else {
      // Default to dark mode
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("platform-theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handlePanelToggle = (panel: "chat" | "agents") => {
    if (panel === "chat") {
      toggleChat();
    } else {
      toggleAgents();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-10 min-h-[40px] max-h-[40px] bg-gray-900/80 backdrop-blur-xl border-b border-gray-700 z-40">
      <div className="h-full flex items-center justify-end px-5 gap-2">
        {/* Panel Control Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-[22px] h-[22px] bg-white/5 backdrop-blur-md rounded-[5px] flex items-center justify-center transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.4)] text-gray-400/60 hover:bg-white/10 hover:shadow-[0_4px_12px_rgba(59,130,246,0.2)] hover:-translate-y-0.5 hover:text-gray-400/80 focus:outline-none focus:shadow-[0_0_0_2px_rgb(59,130,246),0_0_0_4px_rgba(59,130,246,0.2)]"
            aria-label="Panel controls"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="1" y="3" width="14" height="10" rx="0.5" fill="none" />
              <rect x="11" y="3" width="4" height="10" rx="0.5" fill="currentColor" opacity="0.4" />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 min-w-[200px] bg-gray-800/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_4px_16px_rgba(0,0,0,0.4)] overflow-hidden z-50">
              <div className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-700">
                Panels
              </div>
              
              <button
                onClick={() => {
                  handlePanelToggle("chat");
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-transparent hover:border-gray-700"
              >
                <span className="text-sm text-gray-100">Chat</span>
                <div className="relative w-10 h-5 bg-white/5 border border-gray-700 rounded-[10px] transition-all hover:border-blue-500">
                  <div
                    className={`absolute top-[2px] left-[2px] w-4 h-4 bg-gray-500 rounded-full transition-all ${
                      panelState.chatVisible ? "bg-blue-500 translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>

              <button
                onClick={() => {
                  handlePanelToggle("agents");
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <span className="text-sm text-gray-100">Agents Panel</span>
                <div className="relative w-10 h-5 bg-white/5 border border-gray-700 rounded-[10px] transition-all hover:border-blue-500">
                  <div
                    className={`absolute top-[2px] left-[2px] w-4 h-4 bg-gray-500 rounded-full transition-all ${
                      panelState.agentsVisible ? "bg-blue-500 translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-[22px] h-[22px] bg-white/5 backdrop-blur-md rounded-[5px] flex items-center justify-center transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.4)] text-gray-400/60 hover:bg-white/10 hover:shadow-[0_4px_12px_rgba(59,130,246,0.2)] hover:-translate-y-0.5 hover:text-gray-400/80 focus:outline-none focus:shadow-[0_0_0_2px_rgb(59,130,246),0_0_0_4px_rgba(59,130,246,0.2)] relative"
          aria-label="Toggle theme"
        >
          <Sun className={`w-3.5 h-3.5 absolute transition-all duration-300 ${
            theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-80"
          }`} />
          <Moon className={`w-3.5 h-3.5 absolute transition-all duration-300 ${
            theme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-80"
          }`} />
        </button>
      </div>
    </header>
  );
}
