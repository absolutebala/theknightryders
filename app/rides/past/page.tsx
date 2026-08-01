import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import CreateRideButton from "@/components/admin/CreateRideButton";

export default async function PastRidesPage() {
  const supabase = await createClient();

  await supabase.rpc("expire_stale_elite_members");

  const [authResult, isAdminResult, { data: rides }, { data: leaderboard }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("is_admin"),
    supabase
      .from("rides")
      .select("id, slug, title, ride_date, hero_image_url")
      .order("ride_date", { ascending: false, nullsFirst: false }),
    supabase
      .from("ride_leaderboard")
      .select("rider_key, rider_name, member_id, handle, rides_count, total_km, profile_template, profile_photo_url")
      .limit(5),
  ]);

  const {
    data: { user },
  } = authResult;
  const cookieStore = await cookies();
  const editModeOn = cookieStore.get("edit_mode")?.value === "true";
  const isAdmin = !!user && !!isAdminResult.data && editModeOn;

  return (
    <>
      <section style={{ paddingBottom: 20 }}>
        <div className="container">
          <span className="eyebrow-sm">The Journey So Far</span>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
            <div>
              <h1 className="section-title">Past Rides</h1>
              <p className="section-sub">
                {rides?.length ?? 0} rides and counting -- every trip, every
                destination, every memory.
              </p>
            </div>
            {isAdmin && <CreateRideButton />}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="past-rides-layout">
            <div className="past-rides-grid">
              {rides?.map((ride) => (
                <a key={ride.id} href={`/rides/${ride.slug}`}>
                  <figure>
                    {ride.hero_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ride.hero_image_url} alt={ride.title} />
                    ) : (
                      <div className="no-image">{ride.title}</div>
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
                          {entry.profile_photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={entry.profile_photo_url}
                              alt=""
                              style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: "50%",
                                background: "var(--mint)",
                                color: "var(--navy)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              {entry.rider_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="rides-sidebar-name">
                            {entry.rider_name}
                            {entry.profile_template === "elite" && (
                              <span title="Elite member" style={{ fontSize: 12, marginLeft: 4 }}>
                                &#128081;
                              </span>
                            )}
                          </span>
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
