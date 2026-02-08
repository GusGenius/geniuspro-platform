"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function Header() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("platform-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    } else {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

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

  return (
    <header className="fixed top-0 left-0 right-0 h-10 min-h-[40px] max-h-[40px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 z-40">
      <div className="h-full flex items-center justify-end px-5 gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-[22px] h-[22px] bg-gray-100 dark:bg-white/5 backdrop-blur-md rounded-[5px] flex items-center justify-center transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] text-gray-500 dark:text-gray-400/60 hover:bg-gray-200 dark:hover:bg-white/10 hover:shadow-[0_4px_12px_rgba(59,130,246,0.2)] hover:-translate-y-0.5 hover:text-gray-600 dark:hover:text-gray-400/80 focus:outline-none focus:shadow-[0_0_0_2px_rgb(59,130,246),0_0_0_4px_rgba(59,130,246,0.2)] relative"
          aria-label="Toggle theme"
        >
          <Sun
            className={`w-3.5 h-3.5 absolute transition-all duration-300 ${
              theme === "dark"
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 -rotate-90 scale-80"
            }`}
          />
          <Moon
            className={`w-3.5 h-3.5 absolute transition-all duration-300 ${
              theme === "light"
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 rotate-90 scale-80"
            }`}
          />
        </button>
      </div>
    </header>
  );
}
