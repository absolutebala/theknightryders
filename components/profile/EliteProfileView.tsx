import EliteGallery, { type MemberPhoto } from "./EliteGallery";
import EliteRidesCarousel from "./EliteRidesCarousel";
import EliteBackgroundEditor from "./EliteBackgroundEditor";

const GOLD = "#d4af37";
const GOLD_GLOW = "rgba(212,175,55,0.4)";
const GLASS_BG = "rgba(18,22,31,0.75)";
const GLASS_BORDER = "rgba(212,175,55,0.3)";

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
  backgroundSource: "auto" | "custom";
  customBackgroundUrl: string | null;
  customBackgroundPosition: number;
  latestRideImageUrl: string | null;
  latestRideImagePosition: number;
};

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6">
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" />
      <path d="M7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4" />
      <path d="M12 13v3M9 20h6M10 17h4v3h-4z" />
    </svg>
  );
}

function MedalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6">
      <path d="M8 3l4 6-4 3-4-3 4-6zM16 3l-4 6 4 3 4-3-4-6z" />
      <circle cx="12" cy="15" r="6" />
      <path d="M12 12.5l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2-1.5-1.4 2-.3z" />
    </svg>
  );
}

function HexStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div style={{ textAlign: "center", width: 148 }}>
      <div
        style={{
          position: "relative",
          width: 138,
          height: 120,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
            background: "linear-gradient(160deg, #1c2029, #05060a)",
            border: `1.5px solid ${GOLD}`,
            boxShadow: `0 0 18px rgba(212,175,55,.25), inset 0 0 12px rgba(0,0,0,.6)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%)",
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "#0c0e12",
            border: `1.5px solid ${GOLD}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 600,
              fontSize: value.toString().length > 6 ? 16 : 21,
              color: GOLD,
              letterSpacing: "1px",
              textShadow: "0 0 8px rgba(212,175,55,.6)",
            }}
          >
            {value}
          </span>
        </div>
      </div>
      <div
        style={{
          fontSize: 11.5,
          color: "#c9cdd3",
          textTransform: "uppercase",
          letterSpacing: ".08em",
          marginTop: 10,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function parseRideNumber(title: string): string | null {
  const match = title.match(/ride\s*#\s*(\d+)/i);
  return match ? `#${match[1]}` : null;
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
  backgroundSource,
  customBackgroundUrl,
  customBackgroundPosition,
  latestRideImageUrl,
  latestRideImagePosition,
}: Props) {
  const joinYear = joinDate ? new Date(joinDate).getFullYear() : null;

  const useCustomBg = backgroundSource === "custom" && !!customBackgroundUrl;
  const bgUrl = useCustomBg ? customBackgroundUrl : latestRideImageUrl;
  const bgPosition = useCustomBg ? customBackgroundPosition : latestRideImagePosition;

  return (
    <div
      style={{
        position: "relative",
        background: bgUrl
          ? `radial-gradient(circle at 50% 10%, rgba(212,175,55,.08) 0%, transparent 60%), linear-gradient(to bottom, rgba(8,10,15,.7), rgba(8,10,15,.95)), url('${bgUrl}') center ${bgPosition}%/cover no-repeat fixed`
          : "radial-gradient(circle at 50% 10%, rgba(212,175,55,.08) 0%, transparent 60%), #080a0f",
        minHeight: "100vh",
        padding: "60px 24px 90px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {isOwner && (
        <EliteBackgroundEditor
          memberId={memberId}
          backgroundSource={backgroundSource}
          customImageUrl={customBackgroundUrl}
          customImagePosition={customBackgroundPosition}
          latestRideImageUrl={latestRideImageUrl}
        />
      )}

      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        {isOwner && (
          <div style={{ textAlign: "right", marginBottom: 20 }}>
            <a
              href="/members/edit"
              style={{
                display: "inline-block",
                background: "transparent",
                color: GOLD,
                border: `1.5px solid ${GOLD}`,
                padding: "8px 22px",
                fontSize: 12.5,
                borderRadius: 20,
                textDecoration: "none",
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
                background: "linear-gradient(160deg, rgba(24,28,36,.85), rgba(10,12,16,.85))",
                backdropFilter: "blur(12px)",
                border: `1.5px solid ${GOLD}`,
                outline: "1px solid rgba(212,175,55,.25)",
                outlineOffset: 4,
                borderRadius: 20,
                padding: 32,
                boxShadow: "0 15px 35px rgba(0,0,0,.6), 0 0 30px rgba(212,175,55,.12), inset 0 0 20px rgba(212,175,55,.08)",
                marginBottom: 30,
              }}
            >
              <div
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 500,
                  fontSize: 16,
                  letterSpacing: "2px",
                  color: "#8899a6",
                  borderBottom: "1px solid rgba(255,255,255,.1)",
                  paddingBottom: 12,
                  marginBottom: 22,
                  textTransform: "uppercase",
                }}
              >
                The Knight Ryders <span style={{ color: GOLD }}>|</span> Rider Dossier
              </div>

              <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    padding: 4,
                    background: `linear-gradient(135deg, ${GOLD}, transparent, ${GOLD})`,
                    boxShadow: `0 0 25px ${GOLD_GLOW}`,
                    flexShrink: 0,
                  }}
                >
                  {profilePhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profilePhotoUrl}
                      alt={fullName ?? "Rider"}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #080a0f",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        background: "#080a0f",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: GOLD,
                        fontSize: 36,
                        fontWeight: 800,
                        border: "2px solid #080a0f",
                      }}
                    >
                      {(fullName ?? "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontWeight: 700,
                      fontSize: 30,
                      letterSpacing: "1px",
                      color: GOLD,
                      textTransform: "uppercase",
                      lineHeight: 1.1,
                    }}
                  >
                    {fullName ?? "Knight Ryder"}
                  </div>
                  <div style={{ color: "#a0aec0", fontSize: 14, marginTop: 4 }}>
                    {handle && `@${handle}`}
                    {handle && dateOfBirth && " • "}
                    {dateOfBirth &&
                      `Born ${new Date(dateOfBirth).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}`}
                  </div>
                  {joinYear && (
                    <div
                      style={{
                        display: "inline-block",
                        marginTop: 10,
                        background: "rgba(212,175,55,.15)",
                        border: `1px solid ${GOLD}`,
                        color: GOLD,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "2px",
                        padding: "4px 12px",
                        borderRadius: 4,
                        textTransform: "uppercase",
                      }}
                    >
                      Member | Est. {joinYear}
                    </div>
                  )}
                </div>
              </div>

              {bio && (
                <p
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontWeight: 600,
                    fontSize: 22,
                    color: "#f0e6d2",
                    lineHeight: 1.4,
                    borderLeft: `3px solid ${GOLD}`,
                    background: "rgba(0,0,0,.2)",
                    padding: "12px 18px",
                    borderRadius: "0 8px 8px 0",
                    marginTop: 22,
                  }}
                >
                  &ldquo;{bio}&rdquo;
                </p>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 36 }}>
              <HexStat icon={<GearIcon />} value={totalKm.toLocaleString("en-IN")} label="KMs Covered" />
              <HexStat icon={<TrophyIcon />} value={ridesCount} label="Rides Participated" />
              <HexStat
                icon={<MedalIcon />}
                value={joinYear ? `${new Date(joinDate!).toLocaleDateString("en-IN", { month: "short" }).toUpperCase()} ${joinYear}` : "—"}
                label="Member Since"
              />
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
                        background: GLASS_BG,
                        backdropFilter: "blur(8px)",
                        border: `1px solid ${GLASS_BORDER}`,
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
                            background: "#080a0f",
                            color: GOLD,
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
