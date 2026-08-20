import EliteGallery, { type MemberPhoto } from "./EliteGallery";
import EliteRidesCarousel from "./EliteRidesCarousel";
import EliteBackgroundEditor from "./EliteBackgroundEditor";
import EliteAvatarEditor from "./EliteAvatarEditor";
import EliteNameEditor from "./EliteNameEditor";
import EliteHandleEditor from "./EliteHandleEditor";
import EliteBioEditor from "./EliteBioEditor";
import EliteJourneyEditor from "./EliteJourneyEditor";
import RequestEliteBanner from "./RequestEliteBanner";
import RenewEliteButton from "./RenewEliteButton";
import RemoveMyProfileButton from "./RemoveMyProfileButton";
import AssignRidesButton from "@/components/admin/AssignRidesButton";
import RideBadgeStrip from "@/components/RideBadgeStrip";
import BadgeProgressionLadder from "./BadgeProgressionLadder";
import NextTierProgress from "./NextTierProgress";
import { getRideBadgeTier } from "@/lib/rideBadges";
import { generateJourneyNarrative } from "@/lib/journeyNarrative";

type Ride = {
  id: string;
  slug: string;
  title: string;
  ride_date: string | null;
  hero_image_url: string | null;
  ride_number: number | null;
};

type CoRider = {
  id: string;
  full_name: string | null;
  handle: string | null;
  bio: string | null;
  profile_photo_url: string | null;
  ride_count: number;
  shared_rides: number;
  profile_template: string | null;
};

type Props = {
  memberId: string;
  isOwner: boolean;
  isAdmin: boolean;
  isHidden: boolean;
  fullName: string | null;
  handle: string | null;
  bio: string | null;
  dateOfBirth: string | null;
  bloodGroup: string | null;
  joinDate: string | null;
  profilePhotoUrl: string | null;
  socialLinks: Record<string, string> | null;
  journeyText: string | null;
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
  viewerMemberId: string | null;
  viewerHasElite: boolean;
  viewerRequestPending: boolean;
  daysUntilExpiry: number | null;
  renewalPending: boolean;
};

export default function EliteProfileView({
  memberId,
  isOwner,
  isAdmin,
  isHidden,
  fullName,
  handle,
  bio,
  dateOfBirth,
  bloodGroup,
  joinDate,
  profilePhotoUrl,
  socialLinks,
  journeyText,
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
  viewerMemberId,
  viewerHasElite,
  viewerRequestPending,
  daysUntilExpiry,
  renewalPending,
}: Props) {
  const joinYear = joinDate ? new Date(joinDate).getFullYear() : null;
  const journeyNarrative = generateJourneyNarrative({
    memberId,
    fullName,
    totalKm,
    ridesCount,
    joinYear,
    rides,
    topCoRider: coRiders[0] ?? null,
  });
  const instagram = socialLinks?.instagram;

  const useCustomBg = backgroundSource === "custom" && !!customBackgroundUrl;
  const bgUrl = useCustomBg ? customBackgroundUrl : latestRideImageUrl;
  const bgPosition = useCustomBg ? customBackgroundPosition : latestRideImagePosition;

  return (
    <div
      className="elite-page"
      style={{
        position: "relative",
        marginTop: -80,
        paddingTop: 80,
        backgroundImage: bgUrl
          ? `radial-gradient(circle at 50% 20%, rgba(212,175,55,.12) 0%, transparent 50%), linear-gradient(to bottom, rgba(7,9,14,.7), rgba(7,9,14,.95)), url('${bgUrl}')`
          : "radial-gradient(circle at 50% 20%, rgba(212,175,55,.12) 0%, transparent 50%)",
        backgroundSize: "cover",
        backgroundPosition: bgUrl ? `center ${bgPosition}%` : undefined,
        backgroundAttachment: "fixed",
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

      <div className="elite-wrapper">
        {isOwner && (
          <RenewEliteButton memberId={memberId} daysUntilExpiry={daysUntilExpiry} renewalPending={renewalPending} />
        )}
        {/* DOSSIER CARD */}
        <div className="elite-dossier-card">
          {isOwner && (
            <a
              href="/members/edit"
              style={{
                position: "absolute",
                top: 24,
                right: 30,
                display: "inline-block",
                background: "transparent",
                color: "#d4af37",
                border: "1.5px solid #d4af37",
                padding: "7px 20px",
                fontSize: 12,
                borderRadius: 20,
                textDecoration: "none",
              }}
            >
              Edit Profile
            </a>
          )}
          {isOwner && (
            <div style={{ position: "absolute", top: 64, right: 30 }}>
              <RemoveMyProfileButton memberId={memberId} isHidden={isHidden} dark />
            </div>
          )}
          {isAdmin && !isOwner && (
            <div style={{ position: "absolute", top: 24, right: 30, zIndex: 2 }}>
              <AssignRidesButton memberId={memberId} memberName={fullName} />
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 26, paddingBottom: 4 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://hnetzvknrnvscvlnqoct.supabase.co/storage/v1/object/public/homepage/site-assets/tkr-logo-white.png"
              alt="The Knight Ryders"
              style={{ width: 56, height: "auto", opacity: 0.9, marginBottom: 8 }}
            />
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", color: "#d4af37" }}>
              THE KNIGHT RYDERS
            </div>
          </div>
          <div className="elite-dossier-header-title">
            The proud member of The Knight Ryders club
          </div>
          <div className="elite-dossier-body">
            <div>
              <EliteAvatarEditor
                memberId={memberId}
                isOwner={isOwner}
                isAdmin={isAdmin}
                fullName={fullName}
                profilePhotoUrl={profilePhotoUrl}
                showCrown
                rideCount={ridesCount}
              />
              {instagram && (
                <a
                  href={
                    instagram.startsWith("http")
                      ? instagram
                      : `https://instagram.com/${instagram.replace(/^@/, "")}`
                  }
                  target="_blank"
                  rel="noopener"
                  className="elite-instagram-link"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                  Instagram
                </a>
              )}
            </div>
            <div className="elite-profile-details">
              <EliteNameEditor memberId={memberId} isOwner={isOwner} fullName={fullName} />
              <div className="elite-handle">
                <EliteHandleEditor memberId={memberId} isOwner={isOwner} handle={handle} />
                {(handle || isOwner) && dateOfBirth && " • "}
                {dateOfBirth &&
                  `Born ${new Date(dateOfBirth).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}`}
                {dateOfBirth && bloodGroup && " • "}
                {bloodGroup && `Blood Group: ${bloodGroup}`}
              </div>
              {joinYear && (
                <div className="elite-badge-capsule">Member | Since {joinYear}</div>
              )}
              <EliteBioEditor memberId={memberId} isOwner={isOwner} bio={bio} />
            </div>
          </div>

          <RideBadgeStrip rideCount={ridesCount} variant="elite" />
        </div>

        {/* TWO COLUMN: stats+co-riders | photos */}
        <div className="elite-two-col">
          <div>
            <div className="elite-telemetry-row" style={{ marginBottom: 36 }}>
              <div className="elite-stat-card">
                <div className="elite-digital-readout">{totalKm.toLocaleString("en-IN")}</div>
                <div className="elite-stat-label">KMs Covered</div>
              </div>
              <div className="elite-stat-card">
                <div className="elite-digital-readout">{ridesCount}</div>
                <div className="elite-stat-label">Rides Participated</div>
              </div>
              <div className="elite-stat-card">
                <div className="elite-digital-readout">
                  {joinYear
                    ? `${new Date(joinDate!).toLocaleDateString("en-IN", { month: "short" }).toUpperCase()} ${joinYear}`
                    : "—"}
                </div>
                <div className="elite-stat-label">Member Since</div>
              </div>
              <div className="elite-stat-card">
                <div className="elite-digital-readout" style={{ fontSize: "0.68em" }}>
                  {getRideBadgeTier(ridesCount)?.name ?? "—"}
                </div>
                <div className="elite-stat-label">Club Rank</div>
              </div>
            </div>

            <BadgeProgressionLadder rideCount={ridesCount} />

            {coRiders.filter((r) => r.profile_photo_url).length > 0 && (
              <div>
                <div className="elite-subsection-title">Riding Circle</div>
                <div className="elite-co-riders-row">
                  {coRiders
                    .filter((rider) => rider.profile_photo_url)
                    .map((rider) => {
                      const riderTier = getRideBadgeTier(rider.ride_count);
                      return (
                        <a
                          key={rider.id}
                          href={rider.handle ? `/@${rider.handle}` : `/members/${rider.id}`}
                          className="elite-co-rider-card"
                        >
                          <div style={{ position: "relative", display: "inline-block", margin: "0 auto 8px" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={rider.profile_photo_url!}
                              alt={rider.full_name ?? "Rider"}
                              style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", display: "block" }}
                            />
                            {riderTier && (
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: -2,
                                  right: -2,
                                  width: 18,
                                  height: 18,
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background: `radial-gradient(circle at 35% 30%, ${riderTier.colors.shine}, ${riderTier.colors.base} 55%, ${riderTier.colors.edge})`,
                                  border: "1.5px solid #0c0e12",
                                }}
                                title={riderTier.name}
                              >
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M2 18 L2 9 L6.5 13 L9.5 5 L12 13 L14.5 5 L17.5 13 L22 9 L22 18 Z"
                                    fill="#fff"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div style={{ color: "#f0f0f0", fontSize: 12, fontWeight: 700 }}>{rider.full_name}</div>
                          <div style={{ color: "#64748b", fontSize: 10.5, marginTop: 3 }}>
                            {rider.shared_rides} together
                          </div>
                        </a>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          <div>
            <EliteGallery memberId={memberId} isOwner={isOwner} photos={photos} />
          </div>
        </div>

        {/* MY JOURNEY */}
        <EliteJourneyEditor
          memberId={memberId}
          isOwner={isOwner}
          journeyText={journeyText}
          generatedNarrative={journeyNarrative}
        />

        {/* MY RIDES */}
        <EliteRidesCarousel rides={rides} />

        {/* WHAT'S NEXT */}
        <div style={{ marginTop: 40 }}>
          <NextTierProgress rideCount={ridesCount} />
        </div>
      </div>

      <RequestEliteBanner
        viewerMemberId={viewerMemberId}
        viewerHasElite={viewerHasElite}
        viewerRequestPending={viewerRequestPending}
      />
    </div>
  );
}
