import { createClient } from "@/lib/supabase/server";

export default async function PastRidesPage() {
  const supabase = await createClient();

  const { data: rides } = await supabase
    .from("rides")
    .select("id, slug, title, ride_date, hero_image_url")
    .order("ride_date", { ascending: false, nullsFirst: false });

  const { data: leaderboard } = await supabase
    .from("ride_leaderboard")
    .select("rider_key, rider_name, rides_count, total_km")
    .limit(10);

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

      {leaderboard && leaderboard.length > 0 && (
        <section style={{ background: "var(--mint)", paddingTop: 40, paddingBottom: 50 }}>
          <div className="container">
            <h2 className="section-title" style={{ fontSize: 22, marginBottom: 24 }}>
              Leaderboard
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 560, margin: "0 auto" }}>
              {leaderboard.map((entry, i) => (
                <div
                  key={entry.rider_key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "var(--white)",
                    borderRadius: 10,
                    padding: "12px 18px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ color: "var(--amber)", fontWeight: 800, width: 24 }}>
                      #{i + 1}
                    </span>
                    <span style={{ color: "var(--navy)", fontWeight: 700 }}>{entry.rider_name}</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: "var(--grey)" }}>
                    {entry.rides_count} rides · {entry.total_km} km
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="rides-grid">
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
        </div>
      </section>
    </>
  );
}
