"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, UploadCloud } from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";

type LatestVersionRow = {
  id: string;
  version: number;
  created_at: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v : null;
}

function parseLatestVersionRow(v: unknown): LatestVersionRow | null {
  if (!isRecord(v)) return null;
  const id = asString(v.id);
  const version = asNumber(v.version);
  const createdAt = asString(v.created_at);
  if (!id || version === null || !createdAt) return null;
  return { id, version, created_at: createdAt };
}

export function CatPublishPanel(props: {
  catId: string;
  catSlug: string;
  ownerId: string;
  canPublish: boolean;
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latest, setLatest] = useState<LatestVersionRow | null>(null);

  const disabledReason = useMemo(() => {
    if (!user) return "You must be logged in.";
    if (publishing) return "Publishing...";
    return null;
  }, [user, publishing]);

  const loadLatest = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await supabase
        .from("user_cat_versions")
        .select("id, version, created_at")
        .eq("cat_id", props.catId)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (res.error) throw res.error;
      setLatest(parseLatestVersionRow(res.data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load published versions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLatest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, props.catId]);

  const handlePublish = async () => {
    if (!user) return;
    if (!props.canPublish) {
      const ok = confirm(
        "This cat has not had a successful full test run in the UI yet. Publish anyway?"
      );
      if (!ok) return;
    }
    setPublishing(true);
    setError(null);
    try {
      let catQuery = supabase
        .from("user_cats")
        .select("name, description, slug, kittens")
        .eq("id", props.catId);
      if (!props.ownerId || props.ownerId === user.id) {
        catQuery = catQuery.eq("user_id", user.id);
      }
      const catRes = await catQuery.single();
      if (catRes.error || !catRes.data) {
        throw catRes.error ?? new Error("Cat not found");
      }
      const catRow = catRes.data as {
        name?: unknown;
        description?: unknown;
        slug?: unknown;
        kittens?: unknown;
      };

      // Compute next version.
      const nextVersion = (latest?.version ?? 0) + 1;
      const versionOwnerId = props.ownerId || user.id;
      const insertRes = await supabase.from("user_cat_versions").insert({
        user_id: versionOwnerId,
        cat_id: props.catId,
        version: nextVersion,
        name: typeof catRow.name === "string" ? catRow.name : "",
        description: typeof catRow.description === "string" ? catRow.description : "",
        slug: typeof catRow.slug === "string" ? catRow.slug : props.catSlug,
        kittens: Array.isArray(catRow.kittens) ? catRow.kittens : [],
      });
      if (insertRes.error) throw insertRes.error;

      await loadLatest();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="mt-6 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Publish
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Publishes an immutable snapshot. API runs the latest published version.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handlePublish()}
          disabled={!!disabledReason}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title={disabledReason ?? "Publish this cat"}
        >
          {publishing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              Publish
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" />
          Loading publish status...
        </div>
      ) : latest ? (
        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 inline-flex items-center gap-2">
          <Check className="w-3 h-3 text-green-500" />
          Published v{latest.version} · {new Date(latest.created_at).toLocaleString()}
        </div>
      ) : (
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Not published yet.
        </div>
      )}

      {!props.canPublish ? (
        <div className="mt-3 text-xs text-amber-700 dark:text-amber-300">
          Tip: run a successful full test run before publishing (recommended), but publishing is allowed.
        </div>
      ) : null}

      {error ? (
        <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
        </div>
      ) : null}
    </div>
  );
}

