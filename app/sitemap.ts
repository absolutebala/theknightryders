import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://theknightryders.com";

// Rebuilt at most once an hour so new rides show up without a deploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  type SlugRow = { slug: string; ride_date: string | null };
  let rides: SlugRow[] = [];
  let upcoming: SlugRow[] = [];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      const supabase = createClient(url, key);
      const [r, u] = await Promise.all([
        supabase.from("rides").select("slug, ride_date").eq("is_published", true),
        supabase.from("upcoming_rides").select("slug, ride_date"),
      ]);
      rides = (r.data ?? []) as SlugRow[];
      upcoming = (u.data ?? []) as SlugRow[];
    } catch {
      // fall back to the static pages below
    }
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/rides/past`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/rides/upcoming`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/festivals`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/media`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const ridePages: MetadataRoute.Sitemap = rides.map((r) => ({
    url: `${SITE_URL}/rides/${r.slug}`,
    lastModified: r.ride_date ? new Date(r.ride_date) : undefined,
    changeFrequency: "yearly",
    priority: 0.7,
  }));
  const upcomingPages: MetadataRoute.Sitemap = upcoming.map((r) => ({
    url: `${SITE_URL}/rides/upcoming/${r.slug}`,
    lastModified: r.ride_date ? new Date(r.ride_date) : undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...upcomingPages, ...ridePages];
}
