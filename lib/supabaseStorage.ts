import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Deletes the file behind a Supabase Storage public URL, if it is one.
 * Best-effort: failures are swallowed (logged to console) rather than
 * thrown, since a failed cleanup shouldn't block the main upload/update
 * flow the caller is in the middle of.
 */
export async function deleteStorageFileFromUrl(
  supabase: SupabaseClient,
  url: string | null | undefined
) {
  if (!url) return;

  const marker = "/storage/v1/object/public/";
  const idx = url.indexOf(marker);
  if (idx === -1) return; // not a Supabase Storage URL (e.g. still hotlinked elsewhere) -- nothing to clean up

  const rest = url.slice(idx + marker.length); // "bucket/path/to/file.jpg"
  const slashIndex = rest.indexOf("/");
  if (slashIndex === -1) return;

  const bucket = rest.slice(0, slashIndex);
  const path = decodeURIComponent(rest.slice(slashIndex + 1));
  if (!bucket || !path) return;

  try {
    await supabase.storage.from(bucket).remove([path]);
  } catch (err) {
    console.warn("Failed to clean up old storage file:", err);
  }
}
