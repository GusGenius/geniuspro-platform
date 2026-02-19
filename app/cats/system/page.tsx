"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useProfile } from "@/lib/profile/use-profile";
import { supabase } from "@/lib/supabase/client";
import { Zap, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

interface SystemCatRow {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export default function SystemCatsPage() {
  const { user } = useAuth();
  const { isAdmin } = useProfile(user?.id);
  const [cats, setCats] = useState<SystemCatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCats = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("system_cats")
        .select("id, slug, name, description")
        .order("slug");

      if (fetchError) {
        setError(fetchError.message);
        setCats([]);
        return;
      }
      setCats((data as SystemCatRow[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load system cats");
      setCats([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCats();
  }, [fetchCats]);

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-full p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Admin access required
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Only super admins can edit system AGI models.
            </p>
            <Link
              href="/cats"
              className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-full p-6 md:p-10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/cats"
          className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cats
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            System AGI models
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Edit models and instructions for geniuspro-agi-1.2 and geniuspro-code-agi-1.2. Each model is a kitten.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {cats.map((cat) => (
            <Link
              key={cat.id}
              href={`/cats/system/${encodeURIComponent(cat.slug)}`}
              className="block bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {cat.name}
                  </h3>
                  <code className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-900 px-2 py-0.5 rounded font-mono mt-1 inline-block">
                    {cat.slug}
                  </code>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {cat.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
