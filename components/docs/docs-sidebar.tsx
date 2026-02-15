"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

type SectionGroup = {
  label: string;
  items: { id: string; label: string }[];
};

const SECTION_GROUPS: SectionGroup[] = [
  {
    label: "Getting Started",
    items: [
      { id: "quick-start", label: "Quick Start" },
      { id: "cursor-setup", label: "Cursor Setup" },
      { id: "authentication", label: "Authentication" },
      { id: "code-examples", label: "Code Examples" },
    ],
  },
  {
    label: "Endpoints",
    items: [
      { id: "coding-superintelligence", label: "Coding Superintelligence" },
      { id: "vision", label: "Vision Service" },
    ],
  },
  {
    label: "Reference",
    items: [
      { id: "geniuspro-models", label: "GeniusPro Models" },
      { id: "available-models", label: "Available Models" },
      { id: "pricing", label: "Pricing" },
      { id: "rate-limits", label: "Rate Limits" },
      { id: "api-reference", label: "API Reference" },
    ],
  },
];

export function DocsSidebar() {
  const [activeId, setActiveId] = useState<string>("quick-start");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    const ids = SECTION_GROUPS.flatMap((g) => g.items.map((i) => i.id));
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <nav className="hidden xl:block w-56 flex-shrink-0">
      <div className="sticky top-24 space-y-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          On this page
        </p>
        {SECTION_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollTo(item.id)}
                      className={`
                        w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors
                        flex items-center gap-1.5
                        ${
                          isActive
                            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 font-medium"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50"
                        }
                      `}
                    >
                      {isActive && (
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                      )}
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

/* Mobile: horizontal pill bar shown at top of docs */
export function DocsMobileNav() {
  const allItems = SECTION_GROUPS.flatMap((g) => g.items);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="xl:hidden mb-6 -mx-4 sm:-mx-6 md:-mx-10 px-4 sm:px-6 md:px-10 overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 pb-2">
        {allItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className="whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
