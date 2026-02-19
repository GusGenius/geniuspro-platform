import { supabase } from "@/lib/supabase/client";

export async function uploadCatTestImage(args: {
  userId: string;
  catSlug: string;
  file: File;
  kittenId?: string;
}): Promise<{ signedUrl: string; storagePath: string }> {
  const ext = (() => {
    const name = args.file.name || "image";
    const parts = name.split(".");
    return parts.length > 1 ? parts[parts.length - 1] : "jpg";
  })();
  const objectName = args.kittenId
    ? `kitten-${args.kittenId}.${ext}`
    : `test-image.${ext}`;
  const storagePath = `${args.userId}/${args.catSlug}/${objectName}`;

  const up = await supabase.storage
    .from("cat-test-runs")
    .upload(storagePath, args.file, {
      upsert: true,
      contentType: args.file.type || "image/jpeg",
    });
  if (up.error) throw up.error;

  const signed = await supabase.storage
    .from("cat-test-runs")
    .createSignedUrl(storagePath, 60 * 15);
  if (signed.error || !signed.data?.signedUrl) {
    throw signed.error ?? new Error("Failed to create signed URL");
  }
  return { signedUrl: signed.data.signedUrl, storagePath };
}

export async function getSignedUrl(storagePath: string): Promise<string> {
  const signed = await supabase.storage
    .from("cat-test-runs")
    .createSignedUrl(storagePath, 60 * 15);
  if (signed.error || !signed.data?.signedUrl) {
    throw signed.error ?? new Error("Failed to create signed URL");
  }
  return signed.data.signedUrl;
}
