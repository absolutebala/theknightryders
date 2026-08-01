import { createClient } from "@/lib/supabase/server";
import CrownBadge from "@/components/CrownBadge";

export default async function RidersPage() {
  const supabase = await createClient();

  await supabase.rpc("expire_stale_elite_members");

  const [{ data: members }, { data: leaderboard }] = await Promise.all([
    supabase.from("members_public").select("id, full_name, handle, bio, profile_photo_url, profile_template"),
    supabase.from("ride_leaderboard").select("member_id, total_km, rides_count"),
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
            >
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
      </div>
    </section>
  );
}
