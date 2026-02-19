"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { CatDetailSkeleton } from "@/components/pages/cat-detail-skeleton";
import { supabase } from "@/lib/supabase/client";
import { CatForm } from "@/components/cats/cat-form";
import type { CatRow } from "@/components/cats/types";

export default function CatDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<Partial<CatRow> | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user || !id) {
      setLoading(false);
      setNotFound(!id);
      return;
    }
    const userId = user.id;

    async function load() {
      const res = await supabase
        .from("user_cats")
        .select("id, user_id, name, description, slug, kittens, created_at, updated_at")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (res.error || !res.data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setInitial(res.data as Partial<CatRow>);
      setLoading(false);
    }

    load();
  }, [user?.id, id]);

  if (loading) {
    return <CatDetailSkeleton />;
  }

  if (notFound || !initial || !id) {
    return (
      <div className="min-h-full p-6 md:p-10 flex flex-col items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Cat not found or you don&apos;t have access.
        </p>
        <a href="/cats" className="text-blue-500 hover:text-blue-400 text-sm">
          Back to Cats
        </a>
      </div>
    );
  }

  return (
    <CatForm
      mode="edit"
      editingId={id}
      initial={initial}
      backHref="/cats"
      backLabel="Back to Cats"
    />
  );
}

