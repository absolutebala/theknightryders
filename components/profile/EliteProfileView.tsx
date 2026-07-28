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
  backgroundImageUrl: string | null;
};

function HexBadge({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div style={{ textAlign: "center", width: 130 }}>
      <div
        style={{
          width: 118,
          height: 102,
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
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 800,
            fontSize: value.toString().length > 5 ? 17 : 21,
            color: "#f0c24e",
            letterSpacing: ".01em",
          }}
        >
          {value}
        </span>
      </div>
      <div
        style={{
          fontSize: 11,
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
          {/* LEFT: Dossier card */}
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
                  fontSize: 12,
                  letterSpacing: ".12em",
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
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 800,
                      fontSize: 24,
                      color: "#f0c24e",
                      textTransform: "uppercase",
                      lineHeight: 1.15,
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
                    padding: "14px 16px",
                    marginBottom: 16,
                  }}
                >
                  <p style={{ color: "#dcdfe3", fontStyle: "italic", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
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

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 30, flexWrap: "wrap", gap: 16 }}>
              <HexBadge value={totalKm.toLocaleString("en-IN")} label="KMs Covered" />
              <HexBadge value={`${ridesCount} Rides`} label="Participated" />
              <HexBadge value={joinYear ?? "—"} label="Member Since" />
            </div>
          </div>

          {/* RIGHT: Rides */}
          <div>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: 26,
                  color: "#f5f5f5",
                }}
              >
                Rides
              </div>
              <div style={{ fontSize: 11.5, letterSpacing: ".1em", color: "#f0c24e", textTransform: "uppercase" }}>
                Expeditions &amp; Journeys
              </div>
            </div>

            {rides.length === 0 ? (
              <p style={{ color: "#8b929c", textAlign: "center" }}>No ride history linked yet.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 14,
                }}
                className="elite-rides-grid"
              >
                {rides.map((ride) => (
                  <a
                    key={ride.id}
                    href={`/rides/${ride.slug}`}
                    style={{
                      display: "block",
                      borderRadius: 10,
                      overflow: "hidden",
                      border: "1px solid rgba(240,194,78,.25)",
                      background: "#0c0e12",
                    }}
                  >
                    <div style={{ position: "relative", aspectRatio: "4/3", background: "#1a1d24" }}>
                      {ride.hero_image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ride.hero_image_url}
                          alt={ride.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      )}
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ color: "#f0f0f0", fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>
                        {ride.title}
                      </div>
                      {ride.ride_date && (
                        <div style={{ color: "#8b929c", fontSize: 11, marginTop: 3 }}>
                          {new Date(ride.ride_date).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {coRiders.length > 0 && (
          <div style={{ marginTop: 50 }}>
            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 800,
                fontSize: 20,
                color: "#f5f5f5",
                marginBottom: 18,
                textAlign: "center",
              }}
            >
              Frequently Rides With
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
              {coRiders.map((rider) => (
                <a
                  key={rider.id}
                  href={rider.handle ? `/@${rider.handle}` : `/members/${rider.id}`}
                  style={{
                    width: 140,
                    textAlign: "center",
                    background: "rgba(20,24,30,.75)",
                    border: "1px solid rgba(240,194,78,.25)",
                    borderRadius: 10,
                    padding: 16,
                  }}
                >
                  {rider.profile_photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={rider.profile_photo_url}
                      alt={rider.full_name ?? "Rider"}
                      style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", margin: "0 auto 10px" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: "#0c0e12",
                        color: "#f0c24e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 10px",
                        fontWeight: 800,
                      }}
                    >
                      {(rider.full_name ?? "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ color: "#f0f0f0", fontSize: 12.5, fontWeight: 700 }}>{rider.full_name}</div>
                  <div style={{ color: "#8b929c", fontSize: 11, marginTop: 4 }}>
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
