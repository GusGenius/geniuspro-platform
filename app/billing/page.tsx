"use client";

import { useState, useEffect, useCallback } from "react";
import { CreditCard, Loader2, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import { calculateCost, formatCost } from "@/lib/pricing";
// Stripe checkout is handled via server-side session URL redirect

function getMonthStart(): string {
  const now = new Date();
  now.setDate(1);
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

export default function BillingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [creditsBalance, setCreditsBalance] = useState(0);
  const [monthlyCost, setMonthlyCost] = useState(0);
  const [processingStripe, setProcessingStripe] = useState(false);

  const fetchBillingData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch credits balance
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("credits_balance")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Failed to fetch profile:", profileError);
      }

      const balance = profileData?.credits_balance || 0;
      setCreditsBalance(balance);

      // Fetch this month's usage cost
      const monthStart = getMonthStart();
      const { data: usageRows, error: usageError } = await supabase
        .from("usage_logs")
        .select("model, prompt_tokens, completion_tokens")
        .eq("user_id", user.id)
        .gte("created_at", monthStart);

      if (usageError) {
        console.error("Failed to fetch usage:", usageError);
      } else if (usageRows) {
        let cost = 0;
        for (const row of usageRows) {
          cost += calculateCost(
            row.model || "",
            row.prompt_tokens || 0,
            row.completion_tokens || 0
          );
        }
        setMonthlyCost(cost);
      }
    } catch (err) {
      console.error("Failed to fetch billing data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const handleAddCredits = async () => {
    setProcessingStripe(true);
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "credits",
          amount: 100,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      if (!url) {
        throw new Error("No checkout URL returned");
      }

      window.location.href = url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start checkout. Please try again.";
      console.error("Stripe checkout error:", err);
      alert(message);
    } finally {
      setProcessingStripe(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Billing</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your credits and usage</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Credits Balance */}
          <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Credits Balance</h2>
            <div className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">{formatCost(creditsBalance)}</div>
            <div className="w-full bg-gray-200 dark:bg-gray-900 rounded-full h-2 mb-4">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((creditsBalance / 1000) * 100, 100)}%` }}
              />
            </div>
            <button
              onClick={handleAddCredits}
              disabled={processingStripe}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processingStripe ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Add Credits
                </>
              )}
            </button>
          </div>

          {/* Usage Cost This Month */}
          <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Usage Cost This Month</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-semibold text-gray-900 dark:text-white mb-1">{formatCost(monthlyCost)}</div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">Based on token usage from usage logs</div>
              </div>
              <div className="text-gray-300 dark:text-gray-400">
                <Zap className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pay-as-you-go Pricing</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            GeniusPro API uses pay-as-you-go pricing. You only pay for what you use. Credits can be purchased and will be automatically deducted as you make API requests.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-2">Credits never expire</p>
            <p className="mb-2">Automatic deduction from your balance</p>
            <p>
              View the full <a href="/pricing" className="text-blue-500 dark:text-blue-400 hover:underline">pricing table</a> and detailed usage on the <a href="/usage" className="text-blue-500 dark:text-blue-400 hover:underline">Usage</a> page
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
