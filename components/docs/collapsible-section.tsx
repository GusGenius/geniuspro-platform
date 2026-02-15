"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  id: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function CollapsibleSection({
  id,
  title,
  icon: Icon,
  description,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section id={id} className="mb-6 scroll-mt-24">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-3 text-left py-3 -mx-1 px-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group"
        aria-expanded={open}
        aria-controls={`${id}-content`}
      >
        {Icon && <Icon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">
              {description}
            </p>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        id={`${id}-content`}
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden min-h-0">
          <div className="pt-2 pb-4">{children}</div>
        </div>
      </div>
    </section>
  );
}
