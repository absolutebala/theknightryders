import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import RideBadgeStrip from "@/components/RideBadgeStrip";
import RiderRemoveButton from "@/components/admin/RiderRemoveButton";
import { RIDE_BADGE_TIERS } from "@/lib/rideBadges";

export default async function RidersPage() {
  const supabase = await createClient();

  await supabase.rpc("expire_stale_elite_members");

  const [authResult, isAdminResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("is_admin"),
  ]);

  const {
    data: { user },
  } = authResult;
  const cookieStore = await cookies();
  const editModeOn = cookieStore.get("edit_mode")?.value === "true";
  const isAdmin = !!user && !!isAdminResult.data && editModeOn;

  const [{ data: members }, { data: leaderboard }, { data: activityLog }, { data: allRides }, { data: allParticipations }, { data: pendingJoinRequests }] =
    await Promise.all([
      supabase
        .from("members_public")
        .select("id, full_name, handle, bio, profile_photo_url, profile_template, is_hidden, reactivation_requested_at"),
      supabase.from("ride_leaderboard").select("member_id, total_km, rides_count"),
      isAdmin
        ? supabase
            .from("admin_activity_log")
            .select("id, actor_email, action, target_description, created_at")
            .order("created_at", { ascending: false })
            .limit(30)
        : Promise.resolve({ data: null }),
      isAdmin
        ? supabase.from("rides").select("id, ride_date, exclude_from_count").not("ride_date", "is", null).order("ride_date", { ascending: true })
        : Promise.resolve({ data: null }),
      isAdmin
        ? supabase.from("ride_participants").select("member_id, ride_id").not("member_id", "is", null)
        : Promise.resolve({ data: null }),
      isAdmin ? supabase.rpc("get_pending_ride_join_requests") : Promise.resolve({ data: null }),
    ]);

  const statsByMember = new Map(
    (leaderboard ?? [])
      .filter((row) => row.member_id)
      .map((row) => [row.member_id, { total_km: row.total_km, ride_count: row.rides_count }])
  );

  const reactivationRequests = (members ?? [])
    .filter((m) => m.is_hidden && m.reactivation_requested_at)
    .sort((a, b) => (a.reactivation_requested_at! < b.reactivation_requested_at! ? -1 : 1));

  const riders = (members ?? [])
    .map((m) => ({
      ...m,
      total_km: statsByMember.get(m.id)?.total_km ?? 0,
      ride_count: statsByMember.get(m.id)?.ride_count ?? 0,
    }))
    .filter((m) => m.ride_count > 0)
    .filter((m) => !!m.profile_photo_url)
    .filter((m) => isAdmin || !m.is_hidden)
    .sort((a, b) => {
      const aHasPhoto = a.profile_photo_url ? 1 : 0;
      const bHasPhoto = b.profile_photo_url ? 1 : 0;
      if (aHasPhoto !== bHasPhoto) return bHasPhoto - aHasPhoto; // photo members first
      return (b.ride_count ?? 0) - (a.ride_count ?? 0); // then by number of rides, descending
    });

  // Admin-only: for each rider, how many club rides have happened since
  // their own last ride -- surfaces members who've gone quiet.
  let missedRidesReport: { id: string; full_name: string | null; lastRideDate: string; missedCount: number }[] = [];
  if (isAdmin && allRides && allParticipations) {
    // Rides marked exclude_from_count (e.g. a solo/off-club trip) don't
    // count toward anyone's totals -- treat them as invisible here too,
    // both as a ride someone "attended" (so it can't be anyone's last
    // ride) and as a ride that could be "missed" (so it's dropped from
    // the pool entirely).
    const countableRides = allRides.filter((r) => !r.exclude_from_count);
    const rideDateById = new Map(countableRides.map((r) => [r.id, r.ride_date as string]));
    const lastRideDateByMember = new Map<string, string>();
    for (const p of allParticipations) {
      const date = p.member_id ? rideDateById.get(p.ride_id) : undefined;
      if (!date || !p.member_id) continue;
      const current = lastRideDateByMember.get(p.member_id);
      if (!current || date > current) lastRideDateByMember.set(p.member_id, date);
    }

    missedRidesReport = riders
      .map((rider) => {
        const lastRideDate = lastRideDateByMember.get(rider.id);
        if (!lastRideDate) return null;
        const missedCount = countableRides.filter((r) => (r.ride_date as string) > lastRideDate).length;
        return { id: rider.id, full_name: rider.full_name, lastRideDate, missedCount };
      })
      .filter((r): r is { id: string; full_name: string | null; lastRideDate: string; missedCount: number } => r !== null)
      .filter((r) => r.missedCount > 0)
      .sort((a, b) => b.missedCount - a.missedCount);
  }

  return (
    <section style={{ paddingBottom: 70 }}>
      <div className="container">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 24,
            marginBottom: 40,
          }}
        >
          <div>
            <h1 className="section-title" style={{ textAlign: "left", margin: 0 }}>
              Riders
            </h1>
            <p className="section-sub" style={{ textAlign: "left", margin: "6px 0 0" }}>
              {riders.length} member{riders.length === 1 ? "" : "s"} strong.
            </p>
          </div>

          <div className="riders-badge-legend">
            <div className="riders-badge-legend-title">Badge Tiers</div>
            <div className="riders-badge-legend-grid">
              {RIDE_BADGE_TIERS.map((tier) => (
                <div key={tier.level} className="riders-badge-legend-item">
                  <svg width="11" height="9" viewBox="0 0 24 20" style={{ flexShrink: 0, marginTop: 2 }}>
                    <path
                      d="M2 18 L2 9 L6.5 13 L9.5 5 L12 13 L14.5 5 L17.5 13 L22 9 L22 18 Z"
                      fill={tier.colors.base}
                    />
                    <rect x="2" y="16.5" width="20" height="2.5" rx="0.5" fill={tier.colors.base} />
                  </svg>
                  <div>
                    <div>{tier.name}</div>
                    <div className="riders-badge-legend-range">
                      {tier.maxRides === null ? `${tier.minRides}+ rides` : `${tier.minRides}-${tier.maxRides} rides`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="riders-grid">
          {riders.map((rider) => (
            <a
              key={rider.id}
              href={rider.handle ? `/@${rider.handle}` : `/members/${rider.id}`}
              className="rider-card"
              style={{ position: "relative", opacity: rider.is_hidden ? 0.5 : 1 }}
            >
              {isAdmin && <RiderRemoveButton memberId={rider.id} isHidden={!!rider.is_hidden} />}
              {rider.is_hidden && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    background: "#a3312a",
                    color: "#fff",
                    fontSize: 9.5,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 10,
                  }}
                >
                  HIDDEN
                </div>
              )}
              <div style={{ position: "relative", display: "inline-block" }}>
                {rider.profile_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={rider.profile_photo_url} alt={rider.full_name ?? "Rider"} />
                ) : (
                  <div className="rider-card-noimg">
                    {(rider.full_name ?? "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="rider-card-name">{rider.full_name ?? "Knight Ryder"}</div>
              {rider.bio && <p className="rider-card-bio">{rider.bio}</p>}
              <div className="rider-card-stats">
                {rider.ride_count} ride{rider.ride_count === 1 ? "" : "s"}
                {rider.total_km > 0 && <> &middot; {rider.total_km} km</>}
              </div>
              <RideBadgeStrip rideCount={rider.ride_count} />
            </a>
          ))}
        </div>

        {isAdmin && (reactivationRequests.length > 0 || (pendingJoinRequests && pendingJoinRequests.length > 0)) && (
          <div style={{ marginTop: 60, borderTop: "1px solid #e3ebe7", paddingTop: 30 }}>
            <p style={{ fontSize: 13, color: "var(--grey)" }}>
              You have pending Reactivation and/or Ride Join requests --{" "}
              <a href="/admin" style={{ color: "var(--cta-blue)", fontWeight: 700 }}>
                review them on the Admin page
              </a>
              .
            </p>
          </div>
        )}

        {isAdmin && missedRidesReport.length > 0 && (
          <div style={{ marginTop: 60, borderTop: "1px solid #e3ebe7", paddingTop: 30 }}>
            <h2 style={{ fontSize: 16, color: "var(--navy)", marginBottom: 4 }}>
              Riders Going Quiet <span style={{ fontWeight: 400, color: "var(--grey)", fontSize: 12.5 }}>(admin only)</span>
            </h2>
            <p style={{ fontSize: 12.5, color: "var(--grey)", marginBottom: 14 }}>
              How many club rides each rider has missed since their own last one -- most rides missed first.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {missedRidesReport.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 13,
                    color: "var(--dark)",
                    padding: "8px 0",
                    borderBottom: "1px solid #f0f4f2",
                  }}
                >
                  <span>{r.full_name ?? "Knight Ryder"}</span>
                  <span style={{ color: "var(--grey)", fontSize: 12.5 }}>
                    last rode {new Date(r.lastRideDate).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                    {" — "}
                    <strong style={{ color: r.missedCount >= 10 ? "#a3312a" : "var(--dark)" }}>
                      {r.missedCount} ride{r.missedCount === 1 ? "" : "s"} missed
                    </strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isAdmin && (
          <div style={{ marginTop: 60, borderTop: "1px solid #e3ebe7", paddingTop: 30 }}>
            <h2 style={{ fontSize: 16, color: "var(--navy)", marginBottom: 14 }}>
              Activity Log <span style={{ fontWeight: 400, color: "var(--grey)", fontSize: 12.5 }}>(admin only)</span>
            </h2>
            {activityLog && activityLog.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {activityLog.map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      fontSize: 12.5,
                      color: "var(--grey)",
                      padding: "8px 0",
                      borderBottom: "1px solid #f0f4f2",
                    }}
                  >
                    <strong style={{ color: "var(--dark)" }}>{entry.action}</strong>
                    {entry.target_description && <>: {entry.target_description}</>}
                    {" — "}
                    {entry.actor_email} &middot;{" "}
                    {new Date(entry.created_at).toLocaleString("en-IN")}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--grey)", fontSize: 13 }}>No activity yet.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
