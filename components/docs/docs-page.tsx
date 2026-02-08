"use client";

import { BookOpen, Zap, Terminal, Code, DollarSign, Gauge } from "lucide-react";

import { ApiReferenceSection } from "@/components/docs/sections/api-reference-section";
import { AuthenticationSection } from "@/components/docs/sections/authentication-section";
import { AvailableModelsSection } from "@/components/docs/sections/available-models-section";
import { CodeExamplesSection } from "@/components/docs/sections/code-examples-section";
import { CodingSuperintelligenceSection } from "@/components/docs/sections/coding-superintelligence-section";
import { PricingSection } from "@/components/docs/sections/pricing-section";
import { QuickStartSection } from "@/components/docs/sections/quick-start-section";
import { RateLimitsSection } from "@/components/docs/sections/rate-limits-section";
import { useCopy } from "@/components/docs/use-copy";

export default function DocsPage() {
  const { copiedCode, copiedText, copyCode, copyText } = useCopy();

  return (
    <div className="min-h-full p-6 md:p-10 w-full max-w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Documentation</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Learn how to integrate with the GeniusPro API</p>
        </div>

        <QuickStartSection
          icon={Zap}
          copiedText={copiedText}
          onCopyText={copyText}
        />

        <AuthenticationSection icon={Code} copiedText={copiedText} onCopyText={copyText} />

        <CodeExamplesSection
          icon={Terminal}
          copiedCode={copiedCode}
          onCopyCode={copyCode}
        />

        <CodingSuperintelligenceSection
          icon={Terminal}
          copiedCode={copiedCode}
          onCopyCode={copyCode}
        />

        <AvailableModelsSection />

        <PricingSection icon={DollarSign} />

        <RateLimitsSection icon={Gauge} />

        <ApiReferenceSection icon={BookOpen} />
      </div>
    </div>
  );
}

