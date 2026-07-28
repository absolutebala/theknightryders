import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Public profile -- viewable by anyone, no login required.
// Only pulls from members_public (+ the co-riders RPC, which also only
// returns public-safe fields), deliberately excluding private fields like
// address, phone/vehicle number, gender, blood group, etc.
export default async function PublicMemberProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: member } = await supabase
    .from("members_public")
    .select("id, full_name, bio, date_of_birth, join_date, profile_photo_url, ride_count")
    .eq("id", id)
    .maybeSingle();

  if (!member) {
    notFound();
  }

  const { data: participation } = await supabase
    .from("ride_participants")
    .select("km_covered, rides(id, slug, title, ride_date, hero_image_url)")
    .eq("member_id", id);

  type ParticipationRow = {
    km_covered: number;
    rides: {
      id: string;
      slug: string;
      title: string;
      ride_date: string | null;
      hero_image_url: string | null;
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

  const totalKm = participationRows.reduce(
    (sum, p) => sum + (p.km_covered ?? 0),
    0
  );

  const { data: coRidersRaw } = await supabase.rpc("get_frequent_co_riders", {
    target_member_id: id,
    result_limit: 5,
  });

  type CoRider = {
    id: string;
    full_name: string | null;
    bio: string | null;
    profile_photo_url: string | null;
    ride_count: number;
    total_km: number;
    shared_rides: number;
  };

  const coRiders = (coRidersRaw ?? []) as unknown as CoRider[];

  return (
    <div className="container" style={{ padding: "70px 24px", maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 30 }}>
        {member.profile_photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.profile_photo_url}
            alt={member.full_name ?? "Profile photo"}
            style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover" }}
          />
        )}
        <div>
          <h1 style={{ color: "var(--navy)" }}>{member.full_name ?? "Knight Ryder"}</h1>
          {member.date_of_birth && (
            <p style={{ color: "var(--grey)", fontSize: 14 }}>
              Born {new Date(member.date_of_birth).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      </div>

      {member.bio && (
        <p
          style={{
            fontStyle: "italic",
            color: "var(--dark)",
            fontSize: 17,
            lineHeight: 1.6,
            marginBottom: 30,
            borderLeft: "3px solid var(--amber)",
            paddingLeft: 18,
          }}
        >
          &ldquo;{member.bio}&rdquo;
        </p>
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
            {member.ride_count}
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
                <a key={rider.id} href={`/members/${rider.id}`} className="rider-card">
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
