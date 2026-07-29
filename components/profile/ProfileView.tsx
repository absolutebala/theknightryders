import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileBio from "@/components/profile/ProfileBio";
import RequestEliteTemplate from "@/components/profile/RequestEliteTemplate";
import EliteProfileView from "@/components/profile/EliteProfileView";

export default async function ProfileView({ memberId }: { memberId: string }) {
  const supabase = await createClient();

  const { data: member } = await supabase
    .from("members_public")
    .select(
      "id, full_name, handle, bio, date_of_birth, blood_group, join_date, profile_photo_url, profile_template, background_source, background_image_url, background_image_position, social_links"
    )
    .eq("id", memberId)
    .maybeSingle();

  if (!member) {
    notFound();
  }

  // Determine ownership: is the currently logged-in user this profile?
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isOwner = false;
  if (user) {
    const { data: ownRow } = await supabase
      .from("members")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    isOwner = ownRow?.id === member.id;
  }

  const { data: participation } = await supabase
    .from("ride_participants")
    .select("km_covered, rides(id, slug, title, ride_date, hero_image_url, hero_image_position)")
    .eq("member_id", memberId);

  type ParticipationRow = {
    km_covered: number;
    rides: {
      id: string;
      slug: string;
      title: string;
      ride_date: string | null;
      hero_image_url: string | null;
      hero_image_position: number | null;
    } | null;
  };

  const participationRows = (participation ?? []) as unknown as ParticipationRow[];

  const rides = participationRows
    .map((p) => p.rides)
    .filter((r): r is NonNullable<typeof r> => !!r)
    .sort((a, b) => {
      if (!a.ride_date) return 1;
      if (!b.ride_date) return -1;
      return new Date(b.ride_date).getTime() - new Date(a.ride_date).getTime();
    });

  const totalKm = participationRows.reduce((sum, p) => sum + (p.km_covered ?? 0), 0);

  const { data: coRidersRaw } = await supabase.rpc("get_frequent_co_riders", {
    target_member_id: memberId,
    result_limit: 6,
  });

  type CoRider = {
    id: string;
    full_name: string | null;
    handle: string | null;
    bio: string | null;
    profile_photo_url: string | null;
    ride_count: number;
    total_km: number;
    shared_rides: number;
  };

  const coRiders = (coRidersRaw ?? []) as unknown as CoRider[];

  // --- Elite template ---
  if (member.profile_template === "elite") {
    const { data: photos } = await supabase
      .from("member_photos")
      .select("id, image_url, sort_order")
      .eq("member_id", member.id)
      .order("sort_order", { ascending: true });

    return (
      <EliteProfileView
        memberId={member.id}
        isOwner={isOwner}
        fullName={member.full_name}
        handle={member.handle}
        bio={member.bio}
        dateOfBirth={member.date_of_birth}
        bloodGroup={member.blood_group}
        joinDate={member.join_date}
        profilePhotoUrl={member.profile_photo_url}
        socialLinks={member.social_links}
        ridesCount={rides.length}
        totalKm={totalKm}
        rides={rides}
        coRiders={coRiders}
        photos={photos ?? []}
        backgroundSource={member.background_source ?? "auto"}
        customBackgroundUrl={member.background_image_url}
        customBackgroundPosition={member.background_image_position ?? 50}
        latestRideImageUrl={rides[0]?.hero_image_url ?? null}
        latestRideImagePosition={rides[0]?.hero_image_position ?? 50}
      />
    );
  }

  // --- Standard template ---
  let templateRequestStatus: "pending" | "approved" | "rejected" | null = null;
  if (isOwner) {
    const { data: existingRequest } = await supabase
      .from("template_requests")
      .select("status")
      .eq("member_id", member.id)
      .order("requested_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    templateRequestStatus = existingRequest?.status ?? null;
  }

  return (
    <div className="container" style={{ padding: "70px 24px", maxWidth: 900 }}>
      <ProfileHeader
        memberId={member.id}
        isOwner={isOwner}
        fullName={member.full_name}
        handle={member.handle}
        canEditHandle={member.profile_template === "elite"}
        dateOfBirth={member.date_of_birth}
        bloodGroup={member.blood_group}
        profilePhotoUrl={member.profile_photo_url}
      />

      <ProfileBio memberId={member.id} isOwner={isOwner} bio={member.bio} />

      {isOwner && (
        <div style={{ marginBottom: 30 }}>
          <RequestEliteTemplate memberId={member.id} existingRequestStatus={templateRequestStatus} />
        </div>
      )}

      <div
        style={{
          background: "var(--mint)",
          borderRadius: 14,
          padding: 24,
          marginBottom: 40,
          display: "flex",
          gap: 40,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--navy)" }}>
            {rides.length}
          </div>
          <div style={{ fontSize: 13, color: "var(--grey)", textTransform: "uppercase" }}>
            Rides Participated
          </div>
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--navy)" }}>
            {totalKm.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: 13, color: "var(--grey)", textTransform: "uppercase" }}>
            KMs Covered
          </div>
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--navy)" }}>
            {member.join_date
              ? new Date(member.join_date).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                })
              : "—"}
          </div>
          <div style={{ fontSize: 13, color: "var(--grey)", textTransform: "uppercase" }}>
            Member Since
          </div>
        </div>
      </div>

      <div className="profile-two-col">
        <div>
          <h2 style={{ fontSize: 20, color: "var(--navy)", marginBottom: 16 }}>Rides</h2>
          {rides.length === 0 ? (
            <p style={{ color: "var(--grey)" }}>No ride history linked yet.</p>
          ) : (
            <div className="past-rides-grid past-rides-grid-2col">
              {rides.map((ride) => (
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
          )}
        </div>

        {coRiders && coRiders.length > 0 && (
          <div>
            <h2 style={{ fontSize: 20, color: "var(--navy)", marginBottom: 16 }}>
              Frequently Rides With
            </h2>
            <div className="riders-grid riders-grid-1col">
              {coRiders.map((rider) => (
                <a
                  key={rider.id}
                  href={rider.handle ? `/@${rider.handle}` : `/members/${rider.id}`}
                  className="rider-card"
                >
                  {rider.profile_photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={rider.profile_photo_url} alt={rider.full_name ?? "Rider"} />
                  ) : (
                    <div className="rider-card-noimg">
                      {(rider.full_name ?? "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="rider-card-name">{rider.full_name ?? "Knight Ryder"}</div>
                  {rider.bio && <p className="rider-card-bio">{rider.bio}</p>}
                  <div className="rider-card-stats">
                    {rider.shared_rides} ride{rider.shared_rides === 1 ? "" : "s"} together
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
