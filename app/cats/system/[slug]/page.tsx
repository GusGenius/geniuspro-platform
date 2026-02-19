"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useProfile } from "@/lib/profile/use-profile";
import { supabase } from "@/lib/supabase/client";
import { SystemCatForm } from "@/components/cats/system-cat-form";
import type { CatKitten } from "@/components/cats/types";
import { CatDetailSkeleton } from "@/components/pages/cat-detail-skeleton";

const VALID_SLUGS = new Set(["geniuspro-agi-1.2", "geniuspro-code-agi-1.2"]);

export default function SystemCatEditPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : null;
  const { user } = useAuth();
  const { isAdmin } = useProfile(user?.id);
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<{
    name: string;
    description: string;
    kittens: CatKitten[];
  } | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user || !slug || !VALID_SLUGS.has(slug)) {
      setLoading(false);
      setNotFound(!slug || !VALID_SLUGS.has(slug));
      return;
    }

    if (!isAdmin) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    async function load() {
      const { data, error } = await supabase
        .from("system_cats")
        .select("name, description, kittens")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const kittens = Array.isArray(data.kittens) ? data.kittens : [];
      setInitial({
        name: (data.name as string) ?? "",
        description: (data.description as string) ?? "",
        kittens: kittens as CatKitten[],
      });
      setLoading(false);
    }

    load();
  }, [user, slug, isAdmin]);

  if (loading) {
    return <CatDetailSkeleton />;
  }

  if (notFound || !initial || !slug) {
    return (
      <div className="min-h-full p-6 md:p-10 flex flex-col items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          System cat not found or you don&apos;t have access.
        </p>
        <a href="/cats/system" className="text-blue-500 hover:text-blue-400 text-sm">
          Back to System Cats
        </a>
      </div>
    );
  }

  return (
    <SystemCatForm
      slug={slug}
      initial={initial}
      backHref="/cats/system"
      backLabel="Back to System Cats"
    />
  );
}
