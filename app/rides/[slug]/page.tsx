import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import RideHeroEditor from "@/components/admin/RideHeroEditor";
import RideGalleryEditor from "@/components/admin/RideGalleryEditor";
import RideWhatsAppCardPicker from "@/components/admin/RideWhatsAppCardPicker";
import DownloadRideStatusCard from "@/components/DownloadRideStatusCard";
import RideDescriptionEditor from "@/components/admin/RideDescriptionEditor";
import RideParticipantsEditor from "@/components/admin/RideParticipantsEditor";
import AddMeToRideButton from "@/components/AddMeToRideButton";
import RideStatsEditor from "@/components/admin/RideStatsEditor";
import { cleanRideTitle, findTerrainMentions, formatList } from "@/lib/journeyNarrative";

export default async function RideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  await supabase.rpc("expire_stale_elite_members");

  const [rideResult, authResult, isAdminResult] = await Promise.all([
    supabase
      .from("rides")
      .select("id, title, ride_date, hero_image_url, hero_image_position, description, gallery, terrain, total_km, state, destination, ride_number, whatsapp_card_photo_url")
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

  const { data: viewerMember } = user
    ? await supabase.from("members").select("id, full_name").eq("user_id", user.id).maybeSingle()
    : { data: null };

  const { data: participantsRaw } = await supabase
    .from("ride_participants")
    .select("id, member_id, rider_name, km_covered")
    .eq("ride_id", ride.id)
    .order("rider_name", { ascending: true });

  const participants = participantsRaw ?? [];

  const viewerIsParticipant = !!viewerMember && participants.some((p) => p.member_id === viewerMember.id);
  const { data: viewerJoinRequest } =
    viewerMember && !viewerIsParticipant
      ? await supabase
          .from("ride_join_requests")
          .select("status")
          .eq("ride_id", ride.id)
          .eq("member_id", viewerMember.id)
          .maybeSingle()
      : { data: null };
  const memberIds = participants.map((p) => p.member_id).filter((id): id is string => !!id);

  const [{ data: memberProfiles }, { data: liveCounts }] =
    memberIds.length > 0
      ? await Promise.all([
          supabase
            .from("members_public")
            .select("id, full_name, handle, profile_photo_url, profile_template")
            .in("id", memberIds),
          supabase.from("ride_leaderboard").select("member_id, rides_count").in("member_id", memberIds),
        ])
      : [{ data: [] }, { data: [] }];

  const liveCountByMember = new Map((liveCounts ?? []).map((r) => [r.member_id, r.rides_count]));
  const memberById = new Map(
    (memberProfiles ?? []).map((m) => [m.id, { ...m, ride_count: liveCountByMember.get(m.id) ?? 0 }])
  );

  // Distance now lives on the ride itself (rides.total_km), mirrored onto
  // every participant row so aggregate stats elsewhere stay correct.
  const totalKm = ride.total_km ?? participants[0]?.km_covered ?? 0;
  const riderCount = participants.length;
  const rideNumber = ride.ride_number ? `#${ride.ride_number}` : null;
  const destination = ride.destination || cleanRideTitle(ride.title);
  const detectedTerrain = findTerrainMentions([{ title: ride.title, ride_date: ride.ride_date }]);
  const autoTerrain = detectedTerrain.length > 0 ? detectedTerrain[0] : "Open Road";

  const fallbackDescription = [
    `${destination} brought ${riderCount > 0 ? `${riderCount} rider${riderCount === 1 ? "" : "s"}` : "the club"} together`,
    totalKm > 0 ? `for ${totalKm.toLocaleString("en-IN")} kilometers on the road` : null,
    detectedTerrain.length > 0 ? `through ${formatList(detectedTerrain.slice(0, 3))}` : null,
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

        {ride.whatsapp_card_photo_url && (
          <div style={{ position: "absolute", top: 24, right: 24, zIndex: 2 }}>
            <DownloadRideStatusCard
              imageUrl={ride.whatsapp_card_photo_url}
              riderName={viewerIsParticipant ? viewerMember?.full_name ?? null : null}
              riderRideCount={
                viewerIsParticipant && viewerMember ? memberById.get(viewerMember.id)?.ride_count ?? null : null
              }
              totalKm={ride.total_km}
              destination={destination}
              riderCount={participants.length}
              rideTitle={ride.title}
              rideDisplayName={destination}
              rideNumber={ride.ride_number}
            />
          </div>
        )}

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
        <RideStatsEditor
          rideId={ride.id}
          totalKm={ride.total_km}
          riderCount={riderCount}
          terrain={ride.terrain}
          autoTerrain={autoTerrain}
          state={ride.state}
          destination={ride.destination}
          autoDestination={cleanRideTitle(ride.title)}
          isAdmin={isAdmin}
        />
      </section>

      <section style={{ paddingTop: 0, paddingBottom: 20 }}>
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

      <section style={{ paddingTop: 0, paddingBottom: 40 }}>
        <div className="container" style={{ maxWidth: 780 }}>
          <div
            style={{
              background: "var(--mint)",
              borderRadius: 14,
              padding: 24,
            }}
          >
            <RideParticipantsEditor
              rideId={ride.id}
              isAdmin={isAdmin}
              sharedKm={totalKm}
              participants={participants.map((p) => ({
                id: p.id,
                member_id: p.member_id,
                rider_name: p.rider_name,
                member: p.member_id ? memberById.get(p.member_id) ?? null : null,
              }))}
            />
          </div>
          {viewerMember && !viewerIsParticipant && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <AddMeToRideButton
                rideId={ride.id}
                initialStatus={(viewerJoinRequest?.status as "pending" | "rejected" | undefined) ?? null}
              />
            </div>
          )}
        </div>
      </section>

      <section style={{ paddingTop: 0, paddingBottom: 60 }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <RideGalleryEditor rideId={ride.id} gallery={(ride.gallery as string[]) ?? []} isAdmin={isAdmin} />

          {isAdmin && (
            <RideWhatsAppCardPicker
              rideId={ride.id}
              gallery={(ride.gallery as string[]) ?? []}
              currentUrl={ride.whatsapp_card_photo_url}
            />
          )}
        </div>
      </section>
    </>
  );
}
