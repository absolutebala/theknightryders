import { createClient } from "@/lib/supabase/server";

export default async function PastRidesPage() {
  const supabase = await createClient();

  const { data: rides } = await supabase
    .from("rides")
    .select("id, slug, title, ride_date, hero_image_url")
    .order("ride_date", { ascending: false, nullsFirst: false });

  const { data: leaderboard } = await supabase
    .from("ride_leaderboard")
    .select("rider_key, rider_name, member_id, handle, rides_count, total_km")
    .limit(5);

  return (
    <>
      <section style={{ paddingBottom: 20 }}>
        <div className="container">
          <span className="eyebrow-sm">The Journey So Far</span>
          <h1 className="section-title">Past Rides</h1>
          <p className="section-sub">
            {rides?.length ?? 0} rides and counting -- every trip, every
            destination, every memory.
          </p>
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
                          <span className="rides-sidebar-name">{entry.rider_name}</span>
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
