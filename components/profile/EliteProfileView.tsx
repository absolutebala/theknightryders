import EliteGallery, { type MemberPhoto } from "./EliteGallery";
import EliteRidesCarousel from "./EliteRidesCarousel";
import EliteBackgroundEditor from "./EliteBackgroundEditor";
import EliteAvatarEditor from "./EliteAvatarEditor";
import CrownBadge from "@/components/CrownBadge";
import RideBadge from "@/components/RideBadge";
import EliteNameEditor from "./EliteNameEditor";
import EliteHandleEditor from "./EliteHandleEditor";
import EliteBioEditor from "./EliteBioEditor";
import EliteJourneyEditor from "./EliteJourneyEditor";
import RequestEliteBanner from "./RequestEliteBanner";
import RenewEliteButton from "./RenewEliteButton";
import RemoveMyProfileButton from "./RemoveMyProfileButton";
import { generateJourneyNarrative } from "@/lib/journeyNarrative";

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
            </div>

            {coRiders.length > 0 && (
              <div>
                <div className="elite-subsection-title">Frequently Rides With</div>
                <div className="elite-co-riders-row">
                  {coRiders.map((rider) => (
                    <a
                      key={rider.id}
                      href={rider.handle ? `/@${rider.handle}` : `/members/${rider.id}`}
                      className="elite-co-rider-card"
                    >
                      {rider.profile_photo_url ? (
                        <div style={{ position: "relative", display: "inline-block", margin: "0 auto 8px" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={rider.profile_photo_url}
                            alt={rider.full_name ?? "Rider"}
                            style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", display: "block" }}
                          />
                          {rider.profile_template === "elite" && <CrownBadge size={20} />}
                          <RideBadge rideCount={rider.ride_count} size={16} />
                        </div>
                      ) : (
                        <div style={{ position: "relative", display: "inline-block", margin: "0 auto 8px" }}>
                          <div
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: "50%",
                              background: "#07090e",
                              color: "#d4af37",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                            }}
                          >
                            {(rider.full_name ?? "?").charAt(0).toUpperCase()}
                          </div>
                          {rider.profile_template === "elite" && <CrownBadge size={20} />}
                          <RideBadge rideCount={rider.ride_count} size={16} />
                        </div>
                      )}
                      <div style={{ color: "#f0f0f0", fontSize: 12, fontWeight: 700 }}>{rider.full_name}</div>
                      <div style={{ color: "#64748b", fontSize: 10.5, marginTop: 3 }}>
                        {rider.shared_rides} together
                      </div>
                    </a>
                  ))}
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
      </div>

      <RequestEliteBanner
        viewerMemberId={viewerMemberId}
        viewerHasElite={viewerHasElite}
        viewerRequestPending={viewerRequestPending}
      />
    </div>
  );
}
