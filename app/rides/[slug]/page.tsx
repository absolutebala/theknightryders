import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import RideHeroEditor from "@/components/admin/RideHeroEditor";

export default async function RideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: ride } = await supabase
    .from("rides")
    .select("id, title, ride_date, hero_image_url, hero_image_position, description")
    .eq("slug", slug)
    .maybeSingle();

  if (!ride) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: isAdminResult } = await supabase.rpc("is_admin");
  const cookieStore = await cookies();
  const editModeOn = cookieStore.get("edit_mode")?.value === "true";
  const isAdmin = !!user && !!isAdminResult && editModeOn;

  const { data: participants } = await supabase
    .from("ride_participants")
    .select("rider_name, km_covered")
    .eq("ride_id", ride.id)
    .order("km_covered", { ascending: false });

  return (
    <>
      <div style={{ height: 480, overflow: "hidden", position: "relative" }}>
        {ride.hero_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ride.hero_image_url}
            alt={ride.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: `center ${ride.hero_image_position ?? 50}%`,
            }}
          />
        )}
        <RideHeroEditor
          rideId={ride.id}
          isAdmin={isAdmin}
          imageUrl={ride.hero_image_url}
          imagePosition={ride.hero_image_position ?? 50}
        />
      </div>

      <section style={{ paddingBottom: 30 }}>
        <div className="container" style={{ maxWidth: 780 }}>
          <a
            href="/rides/past"
            style={{ fontSize: 13.5, color: "var(--cta-blue)", fontWeight: 700 }}
          >
            &larr; All Past Rides
          </a>
          <h1 style={{ color: "var(--navy)", fontSize: 32, margin: "10px 0 6px" }}>
            {ride.title}
          </h1>
          {ride.ride_date && (
            <p style={{ color: "var(--grey)", fontSize: 14, marginBottom: 30 }}>
              {new Date(ride.ride_date).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}

          {ride.description ? (
            <div style={{ color: "var(--dark)", whiteSpace: "pre-line", lineHeight: 1.8 }}>
              {ride.description}
            </div>
          ) : (
            <p style={{ color: "var(--grey)", fontStyle: "italic" }}>
              No write-up for this ride yet.
            </p>
          )}

          <div
            style={{
              background: "var(--mint)",
              borderRadius: 14,
              padding: 24,
              marginTop: 40,
            }}
          >
            <h2 style={{ fontSize: 18, color: "var(--navy)", marginBottom: 14 }}>
              Riders &amp; KM Covered
            </h2>
            {participants && participants.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {participants.map((p, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #d3e0da",
                      fontSize: 14.5,
                    }}
                  >
                    <span style={{ color: "var(--dark)" }}>{p.rider_name}</span>
                    <span style={{ color: "var(--grey)" }}>{p.km_covered} km</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "var(--grey)", fontSize: 14 }}>
                Participant list not linked yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
