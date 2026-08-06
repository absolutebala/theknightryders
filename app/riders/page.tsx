import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import CrownBadge from "@/components/CrownBadge";
import RideBadge from "@/components/RideBadge";
import RiderRemoveButton from "@/components/admin/RiderRemoveButton";

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

  const [{ data: members }, { data: leaderboard }, { data: activityLog }] = await Promise.all([
    supabase
      .from("members_public")
      .select("id, full_name, handle, bio, profile_photo_url, profile_template, is_hidden"),
    supabase.from("ride_leaderboard").select("member_id, total_km, rides_count"),
    isAdmin
      ? supabase
          .from("admin_activity_log")
          .select("id, actor_email, action, target_description, created_at")
          .order("created_at", { ascending: false })
          .limit(30)
      : Promise.resolve({ data: null }),
  ]);

  const statsByMember = new Map(
    (leaderboard ?? [])
      .filter((row) => row.member_id)
      .map((row) => [row.member_id, { total_km: row.total_km, ride_count: row.rides_count }])
  );

  const riders = (members ?? [])
    .map((m) => ({
      ...m,
      total_km: statsByMember.get(m.id)?.total_km ?? 0,
      ride_count: statsByMember.get(m.id)?.ride_count ?? 0,
    }))
    .filter((m) => m.ride_count > 0)
    .filter((m) => isAdmin || !m.is_hidden)
    .sort((a, b) => (b.total_km ?? 0) - (a.total_km ?? 0));

  return (
    <section style={{ paddingBottom: 70 }}>
      <div className="container">
        <span className="eyebrow-sm">The Knight Ryders</span>
        <h1 className="section-title">Riders</h1>
        <p className="section-sub">
          {riders.length} member{riders.length === 1 ? "" : "s"} strong.
        </p>

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
                {rider.profile_template === "elite" && <CrownBadge size={26} />}
                <RideBadge rideCount={rider.ride_count} size={22} />
              </div>
              <div className="rider-card-name">{rider.full_name ?? "Knight Ryder"}</div>
              {rider.bio && <p className="rider-card-bio">{rider.bio}</p>}
              <div className="rider-card-stats">
                {rider.ride_count} ride{rider.ride_count === 1 ? "" : "s"}
                {rider.total_km > 0 && <> &middot; {rider.total_km} km</>}
              </div>
            </a>
          ))}
        </div>

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
