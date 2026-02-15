"use client";

import { BookOpen, Zap, Terminal, Code, DollarSign, Gauge } from "lucide-react";

import { ApiReferenceSection } from "@/components/docs/sections/api-reference-section";
import { CursorSetupSection } from "@/components/docs/sections/cursor-setup-section";
import { SmartRoutingSection } from "@/components/docs/sections/smart-routing-section";
import { AuthenticationSection } from "@/components/docs/sections/authentication-section";
import { AvailableModelsSection } from "@/components/docs/sections/available-models-section";
import { CodeExamplesSection } from "@/components/docs/sections/code-examples-section";
import { CodingSuperintelligenceSection } from "@/components/docs/sections/coding-superintelligence-section";
import { VisionSection } from "@/components/docs/sections/vision-section";
import { PricingSection } from "@/components/docs/sections/pricing-section";
import { QuickStartSection } from "@/components/docs/sections/quick-start-section";
import { RateLimitsSection } from "@/components/docs/sections/rate-limits-section";
import { DocsSidebar, DocsMobileNav } from "@/components/docs/docs-sidebar";
import { useCopy } from "@/components/docs/use-copy";

export default function DocsPage() {
  const { copiedCode, copiedText, copyCode, copyText } = useCopy();

  return (
    <div className="min-h-full p-4 sm:p-6 md:p-10 w-full max-w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full flex gap-10">
        {/* Main content */}
        <div className="flex-1 min-w-0 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Documentation
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Everything you need to integrate with the GeniusPro API.
            </p>
          </div>

          <DocsMobileNav />

          {/* ── Getting Started ── */}
          <div className="mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Getting Started
            </span>
          </div>

          <QuickStartSection
            icon={Zap}
            copiedText={copiedText}
            onCopyText={copyText}
          />

          <CursorSetupSection
            icon={Terminal}
            copiedText={copiedText}
            onCopyText={copyText}
          />

          <AuthenticationSection
            icon={Code}
            copiedText={copiedText}
            onCopyText={copyText}
          />

          <CodeExamplesSection
            icon={Terminal}
            copiedCode={copiedCode}
            onCopyCode={copyCode}
          />

          {/* ── Endpoints ── */}
          <div className="mb-4 mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Endpoints
            </span>
          </div>

          <CodingSuperintelligenceSection
            icon={Terminal}
            copiedCode={copiedCode}
            onCopyCode={copyCode}
          />

          <VisionSection
            icon={Terminal}
            copiedCode={copiedCode}
            onCopyCode={copyCode}
          />

          {/* ── Reference ── */}
          <div className="mb-4 mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Reference
            </span>
          </div>

          <SmartRoutingSection icon={Zap} />

          <AvailableModelsSection />

          <PricingSection icon={DollarSign} />

          <RateLimitsSection icon={Gauge} />

          <ApiReferenceSection icon={BookOpen} />
        </div>

        {/* Sidebar table of contents (desktop only) */}
        <DocsSidebar />
      </div>
    </div>
  );
}
