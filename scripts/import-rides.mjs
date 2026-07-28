/**
 * Imports the "Past Rides" child pages from a WordPress Pages CSV export
 * into the `rides` table in Supabase.
 *
 * Only pulls pages whose Parent Slug is the Past Rides hub page. Extracts
 * title, date, slug, hero image, and a plain-text description (stripped of
 * the page-builder markup and any [shortcode] placeholders).
 *
 * NOTE: Participant lists and km-covered per ride are NOT in this export --
 * WordPress rendered those via [sidebar_memberslist]/[sidebar_milescovered]
 * shortcodes at view-time, pulled from a separate data source. This script
 * does not (and can't) populate ride_participants. See README for how to
 * add that once the real data source is found.
 *
 * Usage:
 *   node scripts/import-rides.mjs path/to/Pages-Export.csv
 *
 * Requires the same env vars as scripts/import-members.mjs:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import * as cheerio from "cheerio";

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node scripts/import-rides.mjs path/to/Pages-Export.csv");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your environment."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PAST_RIDES_PARENT_SLUG = "past-rides-theknightryders-honda-club";

function extractDescription(html) {
  if (!html) return null;
  const $ = cheerio.load(html);
  const paragraphs = [];
  $("p, h2, h3, li").each((_, el) => {
    const text = $(el).text().trim();
    if (text && !text.startsWith("[")) {
      paragraphs.push(text);
    }
  });
  const description = paragraphs.join("\n");
  return description.trim() || null;
}

function nullIfBlank(value) {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

const csvContent = readFileSync(csvPath, "utf-8");
const rows = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  bom: true,
});

const rideRows = rows.filter((r) => r["Parent Slug"] === PAST_RIDES_PARENT_SLUG);
console.log(`Found ${rideRows.length} ride pages (out of ${rows.length} total pages).`);

const rides = rideRows.map((row) => ({
  wp_id: parseInt(row.ID, 10),
  slug: row.Slug,
  title: nullIfBlank(row.Title),
  ride_date: nullIfBlank(row.Date),
  hero_image_url: nullIfBlank(row["Image URL"]),
  description: extractDescription(row.Content),
  gallery: [],
}));

const BATCH_SIZE = 50;
let imported = 0;

for (let i = 0; i < rides.length; i += BATCH_SIZE) {
  const batch = rides.slice(i, i + BATCH_SIZE);
  const { error } = await supabase.from("rides").upsert(batch, { onConflict: "wp_id" });

  if (error) {
    console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, error.message);
    process.exit(1);
  }

  imported += batch.length;
  console.log(`Imported ${imported}/${rides.length}...`);
}

console.log(
  "Done. Participant lists and km-covered were NOT imported (not present in this export) -- ride_participants is still empty."
);
