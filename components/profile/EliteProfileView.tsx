import EliteGallery, { type MemberPhoto } from "./EliteGallery";
import EliteRidesCarousel from "./EliteRidesCarousel";

type Ride = {
  id: string;
  slug: string;
  title: string;
  ride_date: string | null;
  hero_image_url: string | null;
};

type CoRider = {
  id: string;
  full_name: string | null;
  handle: string | null;
  bio: string | null;
  profile_photo_url: string | null;
  shared_rides: number;
};

type Props = {
  memberId: string;
  isOwner: boolean;
  fullName: string | null;
  handle: string | null;
  bio: string | null;
  dateOfBirth: string | null;
  joinDate: string | null;
  profilePhotoUrl: string | null;
  ridesCount: number;
  totalKm: number;
  rides: Ride[];
  coRiders: CoRider[];
  photos: MemberPhoto[];
  backgroundImageUrl: string | null;
};

function HexBadge({ value, label }: { value: string | number; label: string }) {
  return (
    <div style={{ textAlign: "center", width: 120 }}>
      <div
        style={{
          width: 108,
          height: 94,
          margin: "0 auto",
          clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
          background: "linear-gradient(160deg, #1a1d24, #0c0e12)",
          border: "1px solid rgba(240,194,78,.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 600,
            fontSize: value.toString().length > 5 ? 16 : 20,
            color: "#f0c24e",
            letterSpacing: ".01em",
          }}
        >
          {value}
        </span>
      </div>
      <div
        style={{
          fontSize: 10.5,
          color: "#c9cdd3",
          textTransform: "uppercase",
          letterSpacing: ".06em",
          marginTop: 8,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function EliteProfileView({
  memberId,
  isOwner,
  fullName,
  handle,
  bio,
  dateOfBirth,
  joinDate,
  profilePhotoUrl,
  ridesCount,
  totalKm,
  rides,
  coRiders,
  photos,
  backgroundImageUrl,
}: Props) {
  const joinYear = joinDate ? new Date(joinDate).getFullYear() : null;

  return (
    <div
      style={{
        position: "relative",
        background: backgroundImageUrl
          ? `linear-gradient(180deg, rgba(8,10,14,.88), rgba(8,10,14,.94)), url('${backgroundImageUrl}') center/cover no-repeat fixed`
          : "linear-gradient(160deg, #0c0e12, #17252a)",
        minHeight: "100vh",
        padding: "60px 24px 90px",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        {isOwner && (
          <div style={{ textAlign: "right", marginBottom: 20 }}>
            <a
              href="/members/edit"
              className="btn"
              style={{
                background: "transparent",
                color: "#f0c24e",
                border: "1.5px solid #f0c24e",
                padding: "8px 20px",
                fontSize: 12.5,
              }}
            >
              Edit Profile
            </a>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.4fr", gap: 40 }} className="elite-grid">
          {/* LEFT: Dossier card + stats + co-riders */}
          <div>
            <div
              style={{
                background: "rgba(20,24,30,.75)",
                border: "1px solid rgba(240,194,78,.4)",
                borderRadius: 14,
                padding: 28,
              }}
            >
              <div
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 500,
                  fontSize: 13,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "#e8e8e8",
                  marginBottom: 20,
                  paddingBottom: 14,
                  borderBottom: "1px solid rgba(240,194,78,.3)",
                }}
              >
                The Knight Ryders <span style={{ color: "#f0c24e" }}>|</span> Rider Dossier
              </div>

              <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 18 }}>
                <div
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    padding: 3,
                    background: "linear-gradient(145deg, #f0c24e, #a97c1f)",
                    flexShrink: 0,
                  }}
                >
                  {profilePhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profilePhotoUrl}
                      alt={fullName ?? "Rider"}
                      style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        background: "#0c0e12",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#f0c24e",
                        fontSize: 30,
                        fontWeight: 800,
                      }}
                    >
                      {(fullName ?? "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <div
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontWeight: 700,
                      fontSize: 25,
                      color: "#f0c24e",
                      textTransform: "uppercase",
                      lineHeight: 1.15,
                      letterSpacing: ".01em",
                    }}
                  >
                    {fullName ?? "Knight Ryder"}
                  </div>
                  {handle && (
                    <div style={{ color: "#9aa1ab", fontSize: 13.5, marginTop: 3 }}>@{handle}</div>
                  )}
                  {joinYear && (
                    <div
                      style={{
                        display: "inline-block",
                        marginTop: 10,
                        padding: "4px 12px",
                        borderRadius: 20,
                        border: "1px solid rgba(240,194,78,.5)",
                        color: "#f0c24e",
                        fontSize: 10.5,
                        letterSpacing: ".08em",
                        textTransform: "uppercase",
                        fontFamily: "'Oswald', sans-serif",
                      }}
                    >
                      Member &middot; Est. {joinYear}
                    </div>
                  )}
                </div>
              </div>

              {bio && (
                <div
                  style={{
                    border: "1px solid rgba(240,194,78,.25)",
                    borderRadius: 10,
                    padding: "16px 18px",
                    marginBottom: 16,
                  }}
                >
                  <p
                    style={{
                      color: "#e8dfc8",
                      fontFamily: "'Caveat', cursive",
                      fontWeight: 600,
                      fontSize: 22,
                      lineHeight: 1.35,
                      margin: 0,
                    }}
                  >
                    &ldquo;{bio}&rdquo;
                  </p>
                </div>
              )}

              {dateOfBirth && (
                <div style={{ fontSize: 12, color: "#8b929c" }}>
                  Birthday{" "}
                  {new Date(dateOfBirth).toLocaleDateString("en-IN", { month: "long", day: "numeric" })}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 30, marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
              <HexBadge value={totalKm.toLocaleString("en-IN")} label="KMs Covered" />
              <HexBadge value={`${ridesCount} Rides`} label="Participated" />
              <HexBadge value={joinYear ?? "—"} label="Member Since" />
            </div>

            {coRiders.length > 0 && (
              <div>
                <div
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: 600,
                    fontSize: 17,
                    color: "#f5f5f5",
                    marginBottom: 14,
                  }}
                >
                  Frequently Rides With
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {coRiders.map((rider) => (
                    <a
                      key={rider.id}
                      href={rider.handle ? `/@${rider.handle}` : `/members/${rider.id}`}
                      style={{
                        width: 108,
                        textAlign: "center",
                        background: "rgba(20,24,30,.75)",
                        border: "1px solid rgba(240,194,78,.25)",
                        borderRadius: 10,
                        padding: 12,
                      }}
                    >
                      {rider.profile_photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rider.profile_photo_url}
                          alt={rider.full_name ?? "Rider"}
                          style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover", margin: "0 auto 8px" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: "50%",
                            background: "#0c0e12",
                            color: "#f0c24e",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 8px",
                            fontWeight: 800,
                          }}
                        >
                          {(rider.full_name ?? "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{ color: "#f0f0f0", fontSize: 11.5, fontWeight: 700 }}>
                        {rider.full_name}
                      </div>
                      <div style={{ color: "#8b929c", fontSize: 10, marginTop: 3 }}>
                        {rider.shared_rides} together
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: My Photos + Rides */}
          <div>
            <EliteGallery memberId={memberId} isOwner={isOwner} photos={photos} />
            <EliteRidesCarousel rides={rides} />
          </div>
        </div>
      </div>
    </div>
  );
}
