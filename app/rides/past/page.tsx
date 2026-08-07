import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import CreateRideButton from "@/components/admin/CreateRideButton";
import RidePublishToggle from "@/components/admin/RidePublishToggle";
import { getOrdinalRideLabel } from "@/lib/journeyNarrative";
import { getRideBadgeTier } from "@/lib/rideBadges";

function LeaderboardBadgeLine({ rideCount }: { rideCount: number }) {
  const tier = getRideBadgeTier(rideCount);
  if (!tier) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
      <svg width="10" height="8" viewBox="0 0 24 20" style={{ flexShrink: 0 }}>
        <path
          d="M2 18 L2 9 L6.5 13 L9.5 5 L12 13 L14.5 5 L17.5 13 L22 9 L22 18 Z"
          fill={tier.colors.base}
        />
        <rect x="2" y="16.5" width="20" height="2.5" rx="0.5" fill={tier.colors.base} />
      </svg>
      <span style={{ fontSize: 10.5, fontWeight: 700, color: tier.colors.edge }}>{tier.name}</span>
    </div>
  );
}

export default async function PastRidesPage() {
  const supabase = await createClient();

  await supabase.rpc("expire_stale_elite_members");

  const [authResult, isAdminResult, { data: rides }, { data: leaderboard }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("is_admin"),
    supabase
      .from("rides")
      .select("id, slug, title, ride_date, hero_image_url, is_published, state, destination, ride_number")
      .order("ride_date", { ascending: false, nullsFirst: false }),
    supabase
      .from("ride_leaderboard")
      .select("rider_key, rider_name, member_id, handle, rides_count, total_km, profile_template, profile_photo_url")
      .not("profile_photo_url", "is", null)
      .limit(5),
  ]);

  const {
    data: { user },
  } = authResult;
  const cookieStore = await cookies();
  const editModeOn = cookieStore.get("edit_mode")?.value === "true";
  const isAdmin = !!user && !!isAdminResult.data && editModeOn;
  const visibleRides = (rides ?? []).filter((r) => isAdmin || r.is_published);

  const stateCounts = new Map<string, number>();
  for (const ride of visibleRides) {
    if (ride.state) {
      stateCounts.set(ride.state, (stateCounts.get(ride.state) ?? 0) + 1);
    }
  }
  const statesVisited = Array.from(stateCounts.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <section style={{ paddingBottom: 20 }}>
        <div className="container" style={{ textAlign: "center" }}>
          <span className="eyebrow-sm">The Journey So Far</span>
          <h1 className="section-title">Past Rides</h1>
          <p className="section-sub">
            {visibleRides.length} rides and counting -- every trip, every
            destination, every memory.
          </p>
          {isAdmin && (
            <div style={{ marginTop: 18 }}>
              <CreateRideButton />
            </div>
          )}
        </div>
      </section>

      {statesVisited.length > 0 && (
        <section style={{ paddingBottom: 30 }}>
          <div className="container">
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 10,
                background: "var(--mint)",
                borderRadius: 12,
                padding: "16px 20px",
              }}
            >
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--navy)", marginRight: 4 }}>
                {statesVisited.length} state{statesVisited.length === 1 ? "" : "s"} ridden:
              </span>
              {statesVisited.map(([state, count]) => (
                <span
                  key={state}
                  style={{
                    background: "var(--white)",
                    border: "1px solid #c7d3cf",
                    borderRadius: 16,
                    padding: "4px 12px",
                    fontSize: 12.5,
                    color: "var(--dark)",
                  }}
                >
                  {state} <strong style={{ color: "var(--cta-blue)" }}>&times;{count}</strong>
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="past-rides-layout">
            <div className="past-rides-grid">
              {visibleRides.map((ride) => (
                <a
                  key={ride.id}
                  href={`/rides/${ride.slug}`}
                  style={{ position: "relative", display: "block", opacity: ride.is_published ? 1 : 0.5 }}
                >
                  {isAdmin && <RidePublishToggle rideId={ride.id} isPublished={ride.is_published} />}
                  <figure>
                    {ride.hero_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ride.hero_image_url} alt={ride.title} />
                    ) : (
                      <div className="no-image">{ride.title}</div>
                    )}
                    {getOrdinalRideLabel(ride.ride_number) && (
                      <div className="past-rides-destination-label">{getOrdinalRideLabel(ride.ride_number)}</div>
                    )}
                    <figcaption>
                      {ride.title}
                      {ride.ride_date && (
                        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2, fontWeight: 500 }}>
                          {new Date(ride.ride_date).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      )}
                    </figcaption>
                  </figure>
                </a>
              ))}
            </div>

            {leaderboard && leaderboard.length > 0 && (
              <aside className="rides-sidebar">
                <h2>Leaderboard</h2>
                <div className="rides-sidebar-list">
                  {leaderboard.map((entry, i) => {
                    const row = (
                      <div className="rides-sidebar-row">
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <span className="rides-sidebar-rank">#{i + 1}</span>
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={entry.profile_photo_url ?? undefined}
                              alt=""
                              style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }}
                            />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <span className="rides-sidebar-name">{entry.rider_name}</span>
                            <LeaderboardBadgeLine rideCount={entry.rides_count} />
                          </div>
                        </div>
                        <div className="rides-sidebar-stats">
                          {entry.rides_count} rides
                          <br />
                          {entry.total_km} km
                        </div>
                      </div>
                    );
                    return entry.member_id ? (
                      <a
                        key={entry.rider_key}
                        href={entry.handle ? `/@${entry.handle}` : `/members/${entry.member_id}`}
                      >
                        {row}
                      </a>
                    ) : (
                      <div key={entry.rider_key}>{row}</div>
                    );
                  })}
                </div>
                <a
                  href="/riders"
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginTop: 16,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--cta-blue)",
                  }}
                >
                  View All Riders &rarr;
                </a>
              </aside>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
