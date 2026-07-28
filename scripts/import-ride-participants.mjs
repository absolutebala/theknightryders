/**
 * Imports ride participation + km data into `ride_participants`, using:
 *   - data/ride-participants-raw.tsv  (post_id, serialized coremembers IDs, milescovered)
 *     pulled directly from WordPress's sb_postmeta table
 *   - the WordPress users CSV export (source_user_id -> email), to resolve
 *     WordPress user IDs into the emails already imported into `members`
 *
 * After loading ride_participants, this also recalculates each member's
 * `ride_count` and `ride_list` on the `members` table so /members and the
 * public profile pages reflect real ride history.
 *
 * Usage:
 *   node scripts/import-ride-participants.mjs path/to/user-export.csv
 *
 * Requires the same env vars as the other import scripts:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { parse as parseCsv } from "csv-parse/sync";

const usersCsvPath = process.argv[2];
if (!usersCsvPath) {
  console.error(
    "Usage: node scripts/import-ride-participants.mjs path/to/user-export.csv"
  );
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

// --- Minimal PHP serialized-array parser, just for the shape WordPress
// uses here: a:N:{i:0;s:L:"VALUE";i:1;s:L:"VALUE";...}
function parsePhpStringArray(serialized) {
  const values = [];
  const re = /s:\d+:"([^"]*)"/g;
  let match;
  while ((match = re.exec(serialized)) !== null) {
    values.push(match[1]);
  }
  return values;
}

// --- Load the raw ride participant data (post_id, coremembers, milescovered)
const rawTsv = readFileSync("data/ride-participants-raw.tsv", "utf-8");
const rideRows = parseCsv(rawTsv, {
  columns: true,
  delimiter: "\t",
  skip_empty_lines: true,
  quote: false,
});
console.log(`Loaded ${rideRows.length} rides with participant data.`);

// --- Build WordPress user ID -> email/name map from the users CSV
const usersCsvContent = readFileSync(usersCsvPath, "utf-8");
const userRows = parseCsv(usersCsvContent, {
  columns: true,
  skip_empty_lines: true,
  bom: true,
});

const idToUser = new Map();
for (const row of userRows) {
  const id = row.source_user_id?.trim();
  if (id) {
    idToUser.set(id, {
      email: row.user_email?.trim().toLowerCase(),
      name: row.full_name?.trim() || row.display_name?.trim() || null,
    });
  }
}
console.log(`Loaded ${idToUser.size} WordPress user ID -> email mappings.`);

// --- Fetch existing rides (wp_id -> id) and members (email -> id) from Supabase
const { data: rides, error: ridesError } = await supabase
  .from("rides")
  .select("id, wp_id");
if (ridesError) {
  console.error("Failed to fetch rides:", ridesError.message);
  process.exit(1);
}
const wpIdToRideId = new Map(rides.map((r) => [String(r.wp_id), r.id]));

const { data: members, error: membersError } = await supabase
  .from("members")
  .select("id, email, full_name");
if (membersError) {
  console.error("Failed to fetch members:", membersError.message);
  process.exit(1);
}
const emailToMember = new Map(members.map((m) => [m.email.toLowerCase(), m]));

// --- Build the ride_participants rows
const participantRows = [];
let unmatchedRiders = 0;

for (const row of rideRows) {
  const rideId = wpIdToRideId.get(row.post_id);
  if (!rideId) {
    console.warn(`No ride found for wp_id ${row.post_id}, skipping.`);
    continue;
  }

  const wpUserIds = parsePhpStringArray(row.coremembers);
  const km = parseFloat(row.milescovered) || 0;

  for (const wpUserId of wpUserIds) {
    const user = idToUser.get(wpUserId);
    if (!user) {
      unmatchedRiders++;
      participantRows.push({
        ride_id: rideId,
        member_id: null,
        rider_name: `Unknown rider (WP ID ${wpUserId})`,
        km_covered: km,
      });
      continue;
    }

    const member = emailToMember.get(user.email);
    participantRows.push({
      ride_id: rideId,
      member_id: member?.id ?? null,
      rider_name: member?.full_name || user.name || user.email,
      km_covered: km,
    });
  }
}

console.log(
  `Built ${participantRows.length} participant rows (${unmatchedRiders} riders had no matching WordPress user record).`
);

// --- Clear any previous import for these rides first (safe to re-run)
const rideIds = [...new Set(participantRows.map((p) => p.ride_id))];
const { error: deleteError } = await supabase
  .from("ride_participants")
  .delete()
  .in("ride_id", rideIds);
if (deleteError) {
  console.error("Failed to clear previous participant data:", deleteError.message);
  process.exit(1);
}

// --- Insert in batches
const BATCH_SIZE = 200;
let inserted = 0;
for (let i = 0; i < participantRows.length; i += BATCH_SIZE) {
  const batch = participantRows.slice(i, i + BATCH_SIZE);
  const { error } = await supabase.from("ride_participants").insert(batch);
  if (error) {
    console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, error.message);
    process.exit(1);
  }
  inserted += batch.length;
  console.log(`Inserted ${inserted}/${participantRows.length}...`);
}

// --- Recalculate ride_count + ride_list on the members table
console.log("Recalculating member ride stats...");

// Supabase caps unpaginated selects at 1000 rows by default -- with well
// over 1000 participant rows total, an unpaginated fetch here would
// silently truncate and undercount everyone's stats. Page through in
// batches of 1000 to get everything.
async function fetchAllParticipation() {
  const pageSize = 1000;
  let allRows = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("ride_participants")
      .select("member_id, ride_id, rides(title, ride_date)")
      .not("member_id", "is", null)
      .range(from, from + pageSize - 1);

    if (error) {
      console.error("Failed to fetch participation for stats:", error.message);
      process.exit(1);
    }

    allRows = allRows.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allRows;
}

const allParticipation = await fetchAllParticipation();
console.log(`Fetched ${allParticipation.length} total participation rows for stats.`);

const statsByMember = new Map();
for (const row of allParticipation) {
  if (!statsByMember.has(row.member_id)) {
    statsByMember.set(row.member_id, []);
  }
  statsByMember.get(row.member_id).push({
    title: row.rides?.title,
    date: row.rides?.ride_date,
  });
}

let statsUpdated = 0;
for (const [memberId, rideList] of statsByMember.entries()) {
  rideList.sort((a, b) => new Date(a.date) - new Date(b.date));
  const { error } = await supabase
    .from("members")
    .update({
      ride_count: rideList.length,
      ride_list: rideList.map((r) => r.title),
    })
    .eq("id", memberId);

  if (error) {
    console.error(`Failed to update stats for member ${memberId}:`, error.message);
    continue;
  }
  statsUpdated++;
}

console.log(`Updated ride_count/ride_list for ${statsUpdated} members.`);
console.log("Done.");
