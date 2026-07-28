/**
 * Imports members from a WordPress user-export CSV into Supabase.
 *
 * Only pulls the approved profile fields (name, bio, DOB, join date, gender,
 * blood group, "why joining", vehicle number, address, profile photo, social
 * links). Deliberately ignores everything else in the export -- password
 * hashes, OAuth tokens, WooCommerce/billing data, plugin internals, etc.
 * never get read out of the file.
 *
 * Usage:
 *   node scripts/import-members.mjs path/to/user-export.csv
 *
 * Requires these env vars (same Supabase project, but the SERVICE ROLE key
 * this time -- not the public anon key -- since this needs to bypass RLS to
 * bulk-insert. Get it from Supabase Dashboard -> Project Settings -> API ->
 * "service_role" key. NEVER expose this key in the app or commit it to git;
 * only use it locally for this one-off import.):
 *
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node scripts/import-members.mjs path/to/user-export.csv");
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

// WordPress stores single-value custom fields (gender, etc.) as PHP
// serialized arrays, e.g. a:1:{i:0;s:4:"Male";}. Pull the first string value
// out of that format. Falls back to the raw value if it doesn't match.
function unserializePhpSingleValue(raw) {
  if (!raw) return null;
  const match = raw.match(/s:\d+:"([^"]*)"/);
  return match ? match[1] : raw.trim() || null;
}

function toIsoDate(raw) {
  if (!raw) return null;
  // Handles "1989/04/11" and "1989-04-11" formats seen in the export.
  const normalized = raw.trim().replace(/\//g, "-");
  const parsed = new Date(normalized);
  if (isNaN(parsed.getTime())) return null;
  return normalized;
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

console.log(`Parsed ${rows.length} rows from ${csvPath}`);

const members = rows.map((row) => {
  const socialLinks = {};
  for (const key of ["facebook", "instagram", "twitter", "youtube"]) {
    const value = nullIfBlank(row[key]);
    if (value) socialLinks[key] = value;
  }

  return {
    email: row.user_email?.trim().toLowerCase(),
    full_name: nullIfBlank(row.full_name) ?? nullIfBlank(row.display_name),
    bio: nullIfBlank(row.description),
    date_of_birth: toIsoDate(row.birth_date),
    join_date: toIsoDate(row.user_registered?.split(" ")[0]),
    gender: unserializePhpSingleValue(row.gender),
    blood_group: nullIfBlank(row.blood_group),
    why_joining: nullIfBlank(row.Why_joining),
    vehicle_number: nullIfBlank(row.Vehicle_Number),
    address: nullIfBlank(row.Contact_Address),
    profile_photo_url: nullIfBlank(row.profile_photo),
    social_links: socialLinks,
  };
});

const validMembers = members.filter((m) => m.email);
console.log(`${validMembers.length} rows have a usable email.`);

// Upsert in batches to stay well under any request-size limits.
const BATCH_SIZE = 100;
let imported = 0;

for (let i = 0; i < validMembers.length; i += BATCH_SIZE) {
  const batch = validMembers.slice(i, i + BATCH_SIZE);
  const { error } = await supabase
    .from("members")
    .upsert(batch, { onConflict: "email" });

  if (error) {
    console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, error.message);
    process.exit(1);
  }

  imported += batch.length;
  console.log(`Imported ${imported}/${validMembers.length}...`);
}

console.log("Done. Ride count/list were left at their defaults (0 / []) -- link those once the rides data source is sorted out.");
