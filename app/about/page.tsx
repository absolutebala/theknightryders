import { createClient } from "@/lib/supabase/server";

// Placeholder "About" page linked from the homepage's "Know about our
// club" button. Built from context already established elsewhere on the
// site (hero copy, milestone section) since no reference design was
// provided for this page yet -- replace/expand once we have one.
export default async function AboutPage() {
  const supabase = await createClient();
  const { data: stats } = await supabase
    .from("homepage_stats")
    .select("rides_count, total_km, riders_count")
    .maybeSingle();

  return (
    <section style={{ paddingBottom: 70 }}>
      <div className="container" style={{ maxWidth: 780, paddingTop: 40 }}>
        <span className="eyebrow-sm">Ride till the last mile.</span>
        <h1 className="section-title" style={{ textAlign: "left" }}>
          About The Knight Ryders
        </h1>
        <p style={{ color: "var(--dark)", fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          The Knight Ryders is an exclusive riding club for Honda CB350
          owners -- a community bound by the road, the brand, and the ride
          experiences we share together.
        </p>
        <p style={{ color: "var(--dark)", fontSize: 16, lineHeight: 1.8, marginBottom: 40 }}>
          What started as a handful of riders has grown into a club that
          has covered thousands of kilometers together, taken on social
          causes, and built friendships one ride at a time.
        </p>

        <div
          style={{
            background: "var(--mint)",
            borderRadius: 14,
            padding: 24,
            display: "flex",
            gap: 40,
            flexWrap: "wrap",
            marginBottom: 40,
          }}
        >
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--navy)" }}>
              {stats?.rides_count ?? 0}
            </div>
            <div style={{ fontSize: 13, color: "var(--grey)", textTransform: "uppercase" }}>
              Rides
            </div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--navy)" }}>
              {(stats?.total_km ?? 0).toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: 13, color: "var(--grey)", textTransform: "uppercase" }}>
              Kilometers Covered
            </div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--navy)" }}>
              {stats?.riders_count ?? 0}
            </div>
            <div style={{ fontSize: 13, color: "var(--grey)", textTransform: "uppercase" }}>
              Riders
            </div>
          </div>
        </div>

        <a href="/riders" className="btn btn-amber">
          Meet the Riders
        </a>
      </div>
    </section>
  );
}
