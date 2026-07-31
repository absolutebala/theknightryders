import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import RideHeroEditor from "@/components/admin/RideHeroEditor";
import RideGalleryEditor from "@/components/admin/RideGalleryEditor";
import RideDescriptionEditor from "@/components/admin/RideDescriptionEditor";
import CrownBadge from "@/components/CrownBadge";
import { cleanRideTitle, findTerrainMentions, formatList } from "@/lib/journeyNarrative";

function parseRideNumber(title: string): string | null {
  const match = title.match(/ride\s*#\s*(\d+)/i);
  return match ? `#${match[1]}` : null;
}

export default async function RideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const [rideResult, authResult, isAdminResult] = await Promise.all([
    supabase
      .from("rides")
      .select("id, title, ride_date, hero_image_url, hero_image_position, description, gallery")
      .eq("slug", slug)
      .maybeSingle(),
    supabase.auth.getUser(),
    supabase.rpc("is_admin"),
  ]);

  const ride = rideResult.data;
  if (!ride) {
    notFound();
  }

  const {
    data: { user },
  } = authResult;
  const cookieStore = await cookies();
  const editModeOn = cookieStore.get("edit_mode")?.value === "true";
  const isAdmin = !!user && !!isAdminResult.data && editModeOn;

  const { data: participantsRaw } = await supabase
    .from("ride_participants")
    .select("id, member_id, rider_name, km_covered")
    .eq("ride_id", ride.id)
    .order("rider_name", { ascending: true });

  const participants = participantsRaw ?? [];
  const memberIds = participants.map((p) => p.member_id).filter((id): id is string => !!id);

  const { data: memberProfiles } =
    memberIds.length > 0
      ? await supabase
          .from("members_public")
          .select("id, full_name, handle, profile_photo_url, profile_template")
          .in("id", memberIds)
      : { data: [] };

  const memberById = new Map((memberProfiles ?? []).map((m) => [m.id, m]));

  // Distance is stored once per ride (same value on every participant row
  // from the original import), not summed per-rider.
  const totalKm = participants[0]?.km_covered ?? 0;
  const riderCount = participants.length;
  const rideNumber = parseRideNumber(ride.title);
  const destination = cleanRideTitle(ride.title);
  const terrain = findTerrainMentions([{ title: ride.title, ride_date: ride.ride_date }]);

  const fallbackDescription = [
    `${destination} brought ${riderCount > 0 ? `${riderCount} rider${riderCount === 1 ? "" : "s"}` : "the club"} together`,
    totalKm > 0 ? `for ${totalKm.toLocaleString("en-IN")} kilometers on the road` : null,
    terrain.length > 0 ? `through ${formatList(terrain.slice(0, 3))}` : null,
  ]
    .filter(Boolean)
    .join(" ") + ".";

  return (
    <>
      <div className="ride-hero-frame" style={{ height: 560, overflow: "hidden", position: "relative" }}>
        {ride.hero_image_url ? (
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
        ) : (
          <div style={{ width: "100%", height: "100%", background: "var(--navy)" }} />
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(0deg, rgba(5,8,15,.88) 0%, rgba(5,8,15,.35) 45%, rgba(5,8,15,.15) 100%)",
          }}
        />

        <RideHeroEditor
          rideId={ride.id}
          isAdmin={isAdmin}
          imageUrl={ride.hero_image_url}
          imagePosition={ride.hero_image_position ?? 50}
        />

        <div className="container" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 36, width: "100%" }}>
          <a
            href="/rides/past"
            style={{ fontSize: 13, color: "rgba(255,255,255,.8)", fontWeight: 700, display: "inline-block", marginBottom: 14 }}
          >
            &larr; All Past Rides
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
            {rideNumber && (
              <span
                style={{
                  background: "rgba(0,0,0,.6)",
                  border: "1px solid var(--amber)",
                  color: "var(--amber)",
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "4px 12px",
                  borderRadius: 20,
                }}
              >
                RIDE {rideNumber}
              </span>
            )}
            {ride.ride_date && (
              <span style={{ color: "rgba(255,255,255,.85)", fontSize: 13.5, fontWeight: 600 }}>
                {new Date(ride.ride_date).toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
          <h1
            className="ride-hero-title"
            style={{ color: "#fff", fontSize: 42, fontWeight: 800, lineHeight: 1.1, margin: 0, maxWidth: 800 }}
          >
            {destination}
          </h1>
        </div>
      </div>

      {/* STATS ROW */}
      <section style={{ background: "var(--mint)" }}>
        <div className="container ride-stats-row">
          <div className="ride-stat-card">
            <div className="ride-stat-num">{totalKm > 0 ? totalKm.toLocaleString("en-IN") : "—"}</div>
            <div className="ride-stat-label">Kilometers Covered</div>
          </div>
          <div className="ride-stat-card">
            <div className="ride-stat-num">{riderCount || "—"}</div>
            <div className="ride-stat-label">Riders</div>
          </div>
          <div className="ride-stat-card">
            <div className="ride-stat-num" style={{ fontSize: riderCount ? 28 : undefined }}>
              {terrain.length > 0 ? terrain[0] : "Open Road"}
            </div>
            <div className="ride-stat-label">Terrain</div>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 20 }}>
        <div className="container" style={{ maxWidth: 780 }}>
          <h2 style={{ fontSize: 18, color: "var(--navy)", marginBottom: 14, marginTop: 40 }}>The Ride</h2>
          <RideDescriptionEditor
            rideId={ride.id}
            description={ride.description}
            fallbackText={fallbackDescription}
            isAdmin={isAdmin}
          />
        </div>
      </section>

      <section style={{ paddingBottom: 40 }}>
        <div className="container" style={{ maxWidth: 780 }}>
          <div
            style={{
              background: "var(--mint)",
              borderRadius: 14,
              padding: 24,
            }}
          >
            <h2 style={{ fontSize: 18, color: "var(--navy)", marginBottom: 16 }}>
              Riders on This Trip
            </h2>
            {participants.length > 0 ? (
              <div className="ride-riders-grid">
                {participants.map((p) => {
                  const member = p.member_id ? memberById.get(p.member_id) : null;
                  const content = (
                    <>
                      <div style={{ position: "relative", display: "inline-block" }}>
                        {member?.profile_photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={member.profile_photo_url} alt="" className="ride-rider-avatar" />
                        ) : (
                          <div className="ride-rider-avatar ride-rider-avatar-noimg">
                            {(member?.full_name ?? p.rider_name).charAt(0).toUpperCase()}
                          </div>
                        )}
                        {member?.profile_template === "elite" && <CrownBadge size={18} />}
                      </div>
                      <span className="ride-rider-name">{member?.full_name ?? p.rider_name}</span>
                    </>
                  );

                  return member ? (
                    <a
                      key={p.id}
                      href={member.handle ? `/@${member.handle}` : `/members/${member.id}`}
                      className="ride-rider-card"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={p.id} className="ride-rider-card ride-rider-card-guest">
                      {content}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: "var(--grey)", fontSize: 14 }}>Participant list not linked yet.</p>
            )}
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 60 }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <RideGalleryEditor rideId={ride.id} gallery={(ride.gallery as string[]) ?? []} isAdmin={isAdmin} />
        </div>
      </section>
    </>
  );
}
