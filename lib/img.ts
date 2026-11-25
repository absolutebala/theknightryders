/**
 * Serve Supabase Storage images through Next's image optimiser (/_next/image).
 * The optimiser resizes + converts to WebP and caches the result for a year,
 * so Supabase serves each original only once instead of on every page view.
 * Non-Supabase URLs are returned unchanged.
 */
const SUPABASE_STORAGE = "supabase.co/storage/v1/";

export function thumb(url: string | null | undefined, width = 640): string | undefined {
  if (!url) return undefined;
  if (!url.includes(SUPABASE_STORAGE)) return url;
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=72`;
}
