"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressImage, jpegFilename } from "@/lib/imageCompression";
import { deleteStorageFileFromUrl } from "@/lib/supabaseStorage";
import RideBadgeStrip from "@/components/RideBadgeStrip";
import { downloadPromoCard } from "@/lib/canvasCardDownload";

export type PromoImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

export type BirthdayMember = {
  id: string;
  full_name: string | null;
  handle: string | null;
  profile_photo_url: string | null;
  days_diff: number;
  ride_count: number;
};

export type PromotedMember = {
  id: string;
  full_name: string | null;
  handle: string | null;
  profile_photo_url: string | null;
  ride_count: number;
  tier_promoted_at: string;
};

type PromoMode = "promo" | "birthday" | "promoted" | "holiday" | "upcoming-ride" | "fallback";

type UpcomingRideSummary = {
  slug: string;
  title: string;
  place: string | null;
  ride_date: string;
  end_date: string | null;
  is_multi_day: boolean;
  hero_image_url: string | null;
};

type Props = {
  images: PromoImage[];
  isAdmin: boolean;
  isAdminUser: boolean; // admin status regardless of the Edit Mode toggle
  promoMode: PromoMode; // decided automatically upstream, this component just renders it
  promoTitle: string; // shared across all promo images, not per-image
  birthdayMembers: BirthdayMember[]; // already filtered to whichever set qualifies
  birthdayWish: string;
  promotedMembers: PromotedMember[];
  holidayName: string | null;
  holidayWish: string | null;
  holidayImageUrl: string | null;
  nextUpcomingRide: UpcomingRideSummary | null;
};

const SECTION_KEY = "hero_promo";

function displayDate(daysDiff: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysDiff);
  return d.toLocaleDateString("en-IN", { month: "long", day: "numeric" });
}

export default function HeroPromoSlider({
  images,
  isAdmin,
  isAdminUser,
  promoMode,
  promoTitle,
  birthdayMembers,
  birthdayWish,
  promotedMembers,
  holidayName,
  holidayWish,
  holidayImageUrl,
  nextUpcomingRide,
}: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [bdayIndex, setBdayIndex] = useState(0);
  const [promotedIndex, setPromotedIndex] = useState(0);
  const [managing, setManaging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(promoTitle);
  const [savingTitle, setSavingTitle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentImage = images[imgIndex];
  const currentBirthday = birthdayMembers[bdayIndex];
  const currentPromoted = promotedMembers[promotedIndex];

  const [downloadingCard, setDownloadingCard] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleDownloadCurrentCard() {
    setDownloadingCard(true);
    setDownloadError(null);
    try {
      if (promoMode === "birthday" && currentBirthday) {
        await downloadPromoCard({
          title: "Happy Birthday",
          imageUrl: currentBirthday.profile_photo_url,
          imageShape: "circle",
          subtitle: currentBirthday.full_name,
          message: birthdayWish,
          filenameBase: `${currentBirthday.full_name ?? "member"}_birthday`,
        });
      } else if (promoMode === "promoted" && currentPromoted) {
        await downloadPromoCard({
          title: "Recently Promoted To",
          imageUrl: currentPromoted.profile_photo_url,
          imageShape: "circle",
          subtitle: currentPromoted.full_name,
          message: "Congrats on the new badge -- keep the wheels turning!",
          filenameBase: `${currentPromoted.full_name ?? "member"}_promoted`,
        });
      } else if (promoMode === "holiday" && holidayImageUrl) {
        await downloadPromoCard({
          title: holidayName,
          imageUrl: holidayImageUrl,
          imageShape: "rect",
          message: holidayWish || (holidayName ? `Happy ${holidayName}!` : null),
          filenameBase: holidayName ?? "festival",
        });
      } else if (promoMode === "upcoming-ride" && nextUpcomingRide) {
        const dateLabel =
          nextUpcomingRide.is_multi_day && nextUpcomingRide.end_date
            ? `${new Date(nextUpcomingRide.ride_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - ${new Date(nextUpcomingRide.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
            : new Date(nextUpcomingRide.ride_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
        await downloadPromoCard({
          title: "Upcoming Rides",
          imageUrl: nextUpcomingRide.hero_image_url,
          imageShape: "rect",
          message: `${nextUpcomingRide.title}${nextUpcomingRide.place ? ` -- ${nextUpcomingRide.place}` : ""} -- ${dateLabel}`,
          filenameBase: nextUpcomingRide.title,
        });
      } else if (promoMode === "fallback") {
        await downloadPromoCard({
          title: null,
          imageUrl: "/fallback/manivannan.jpeg",
          imageShape: "rect",
          message: null,
          filenameBase: "club_milestone",
        });
      } else if (promoMode === "promo" && currentImage) {
        await downloadPromoCard({
          title: null,
          imageUrl: currentImage.image_url,
          imageShape: "rect",
          message: promoTitle,
          filenameBase: "promo",
        });
      }
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Download failed -- please try again.");
    } finally {
      setDownloadingCard(false);
    }
  }

  // Auto-advance whichever mode is active, pausing while managing.
  useEffect(() => {
    if (managing) return;
    if (promoMode === "promo" && images.length > 1) {
      const timer = setInterval(() => setImgIndex((i) => (i + 1) % images.length), 4500);
      return () => clearInterval(timer);
    }
    if (promoMode === "birthday" && birthdayMembers.length > 1) {
      const timer = setInterval(() => setBdayIndex((i) => (i + 1) % birthdayMembers.length), 4500);
      return () => clearInterval(timer);
    }
    if (promoMode === "promoted" && promotedMembers.length > 1) {
      const timer = setInterval(() => setPromotedIndex((i) => (i + 1) % promotedMembers.length), 4500);
      return () => clearInterval(timer);
    }
  }, [managing, promoMode, images.length, birthdayMembers.length, promotedMembers.length]);

  if (promoMode === "promo" && images.length === 0 && !isAdminUser) return null;
  if (promoMode === "birthday" && birthdayMembers.length === 0 && !isAdminUser) return null;
  if (promoMode === "promoted" && promotedMembers.length === 0 && !isAdminUser) return null;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const supabase = createClient();

    const compressed = await compressImage(file);
    const cleanName = jpegFilename(file.name.replace(/[^a-zA-Z0-9.\-_]/g, ""));
    const path = `${SECTION_KEY}/${Date.now()}-${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from("homepage")
      .upload(path, compressed, { contentType: "image/jpeg" });
    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("homepage").getPublicUrl(path);
    const nextSortOrder = images.length > 0 ? Math.max(...images.map((i) => i.sort_order)) + 1 : 0;

    const { error: insertError } = await supabase.from("homepage_images").insert({
      section_key: SECTION_KEY,
      image_url: publicUrlData.publicUrl,
      sort_order: nextSortOrder,
    });

    setUploading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  async function handleRemove(imageId: string) {
    const supabase = createClient();
    const imageToRemove = images.find((i) => i.id === imageId);
    const { error } = await supabase.from("homepage_images").delete().eq("id", imageId);
    if (error) {
      setError(error.message);
      return;
    }
    if (imageToRemove) {
      await deleteStorageFileFromUrl(supabase, imageToRemove.image_url);
    }
    setImgIndex(0);
    router.refresh();
  }

  async function handleSaveTitle() {
    setSavingTitle(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("homepage_content")
      .update({ title: titleDraft.trim() || "Promo Code : TKRPride" })
      .eq("section_key", SECTION_KEY);
    setSavingTitle(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEditingTitle(false);
    router.refresh();
  }

  return (
    <div className="hero-promo-slider">
      {promoMode === "promo" && (
        <div className="hero-promo-frame">
          <div className="hero-promo-image-area">
            {currentImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentImage.image_url} alt="" />
            ) : (
              isAdmin && <div className="hero-promo-empty">Upload a promo image</div>
            )}

            {images.length > 1 && (
              <div className="hero-promo-dots">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    aria-label={`Show image ${i + 1}`}
                    className={`hero-promo-dot ${i === imgIndex ? "hero-promo-dot-active" : ""}`}
                    onClick={() => setImgIndex(i)}
                  />
                ))}
              </div>
            )}

            {isAdmin && managing && currentImage && (
              <button
                type="button"
                aria-label="Remove image"
                className="hero-promo-remove"
                onClick={() => handleRemove(currentImage.id)}
              >
                &#10005;
              </button>
            )}
          </div>

          {promoTitle && <div className="hero-promo-caption-row">{promoTitle}</div>}
        </div>
      )}

      {promoMode === "birthday" && (
        <div className="hero-promo-frame hero-promo-birthday-frame">
          <div className="hero-promo-birthday-title-row">&#127881; Happy Birthday</div>

          <div className="hero-promo-birthday-profile-row">
            {birthdayMembers.length > 1 && (
              <button
                type="button"
                aria-label="Previous member"
                className="hero-promo-birthday-nav hero-promo-birthday-prev"
                onClick={() => setBdayIndex((i) => (i - 1 + birthdayMembers.length) % birthdayMembers.length)}
              >
                &#8249;
              </button>
            )}

            {currentBirthday ? (
              <a
                href={currentBirthday.handle ? `/@${currentBirthday.handle}` : `/members/${currentBirthday.id}`}
                className="hero-promo-birthday-profile"
              >
                {currentBirthday.profile_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentBirthday.profile_photo_url} alt="" />
                ) : (
                  <div className="hero-promo-birthday-noimg">
                    {(currentBirthday.full_name ?? "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hero-promo-birthday-name">{currentBirthday.full_name ?? "Knight Ryder"}</span>
                <span className="hero-promo-birthday-date">{displayDate(currentBirthday.days_diff)}</span>
              </a>
            ) : (
              isAdmin && <div className="hero-promo-empty">No birthdays nearby</div>
            )}

            {birthdayMembers.length > 1 && (
              <button
                type="button"
                aria-label="Next member"
                className="hero-promo-birthday-nav hero-promo-birthday-next"
                onClick={() => setBdayIndex((i) => (i + 1) % birthdayMembers.length)}
              >
                &#8250;
              </button>
            )}
          </div>

          <div className="hero-promo-birthday-message">{birthdayWish}</div>
          {currentBirthday && (
            <div style={{ padding: "0 16px 12px" }}>
              <RideBadgeStrip rideCount={currentBirthday.ride_count} variant="promo-slider" />
            </div>
          )}
        </div>
      )}

      {promoMode === "promoted" && (
        <div className="hero-promo-frame hero-promo-birthday-frame">
          <div className="hero-promo-birthday-title-row">&#127942; Recently Promoted To</div>

          <div className="hero-promo-birthday-profile-row">
            {promotedMembers.length > 1 && (
              <button
                type="button"
                aria-label="Previous member"
                className="hero-promo-birthday-nav hero-promo-birthday-prev"
                onClick={() => setPromotedIndex((i) => (i - 1 + promotedMembers.length) % promotedMembers.length)}
              >
                &#8249;
              </button>
            )}

            {currentPromoted ? (
              <a
                href={currentPromoted.handle ? `/@${currentPromoted.handle}` : `/members/${currentPromoted.id}`}
                className="hero-promo-birthday-profile"
              >
                {currentPromoted.profile_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentPromoted.profile_photo_url} alt="" />
                ) : (
                  <div className="hero-promo-birthday-noimg">
                    {(currentPromoted.full_name ?? "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hero-promo-birthday-name">{currentPromoted.full_name ?? "Knight Ryder"}</span>
              </a>
            ) : (
              isAdmin && <div className="hero-promo-empty">No recent promotions</div>
            )}

            {promotedMembers.length > 1 && (
              <button
                type="button"
                aria-label="Next member"
                className="hero-promo-birthday-nav hero-promo-birthday-next"
                onClick={() => setPromotedIndex((i) => (i + 1) % promotedMembers.length)}
              >
                &#8250;
              </button>
            )}
          </div>

          <div className="hero-promo-birthday-message">
            Congrats on the new badge -- keep the wheels turning!
          </div>
          {currentPromoted && (
            <div style={{ padding: "0 16px 12px" }}>
              <RideBadgeStrip rideCount={currentPromoted.ride_count} variant="promo-slider" />
            </div>
          )}
        </div>
      )}

      {promoMode === "holiday" && holidayImageUrl && (
        <div className="hero-promo-frame">
          <div className="hero-promo-birthday-title-row">{holidayName}</div>
          <div className="hero-promo-image-area">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={holidayImageUrl} alt={holidayName ?? ""} />
          </div>
          <div className="hero-promo-birthday-message">{holidayWish || `Happy ${holidayName}!`}</div>
        </div>
      )}

      {promoMode === "upcoming-ride" && nextUpcomingRide && (
        <a href={`/rides/upcoming/${nextUpcomingRide.slug}`} className="hero-promo-frame" style={{ display: "block", textDecoration: "none" }}>
          <div className="hero-promo-birthday-title-row">Upcoming Rides</div>
          <div className="hero-promo-image-area">
            {nextUpcomingRide.hero_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={nextUpcomingRide.hero_image_url} alt={nextUpcomingRide.title} />
            ) : (
              <div className="hero-promo-empty">{nextUpcomingRide.title}</div>
            )}
          </div>
          <div className="hero-promo-birthday-message">
            {nextUpcomingRide.title}
            {nextUpcomingRide.place && ` -- ${nextUpcomingRide.place}`}
            {" -- "}
            {nextUpcomingRide.is_multi_day && nextUpcomingRide.end_date
              ? `${new Date(nextUpcomingRide.ride_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - ${new Date(nextUpcomingRide.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
              : new Date(nextUpcomingRide.ride_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </a>
      )}

      {promoMode === "fallback" && (
        <div className="hero-promo-frame">
          <div className="hero-promo-image-area">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fallback/manivannan.jpeg" alt="Club milestone" />
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 10 }}>
        <button
          type="button"
          className="hero-promo-manage-btn"
          onClick={handleDownloadCurrentCard}
          disabled={downloadingCard}
        >
          {downloadingCard ? "Preparing…" : "Download This Card"}
        </button>
        {downloadError && (
          <div style={{ fontSize: 10, color: "#e57373", marginTop: 4, textAlign: "center" }}>{downloadError}</div>
        )}
      </div>

      {isAdmin && (
        <div className="hero-promo-admin-panel">
          {promoMode === "birthday" && (
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.55)", textAlign: "center" }}>
              Birthday slide showing automatically right now (a member&apos;s birthday is today or
              within 2 days). You can still manage promo images below for when it's not active.
            </div>
          )}
          {promoMode === "holiday" && (
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.55)", textAlign: "center" }}>
              Showing today&apos;s holiday card ({holidayName}). Manage holiday images further down the homepage.
            </div>
          )}
          {promoMode === "upcoming-ride" && (
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.55)", textAlign: "center" }}>
              No birthday, holiday, or recent promotion today -- showing the nearest upcoming ride instead.
            </div>
          )}
          {promoMode === "fallback" && (
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.55)", textAlign: "center" }}>
              Nothing else to show right now -- falling back to the default club milestone image.
            </div>
          )}

          <div className="hero-promo-admin">
            <button
              type="button"
              className="hero-promo-manage-btn"
              onClick={() => setManaging((m) => !m)}
            >
              {managing ? "Done" : "Manage"}
            </button>
            {managing && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  style={{ display: "none" }}
                  id="hero-promo-upload"
                />
                <label
                  htmlFor="hero-promo-upload"
                  className="hero-promo-manage-btn"
                  style={{ cursor: "pointer" }}
                >
                  {uploading ? "Uploading…" : "+ Add"}
                </label>
              </>
            )}
          </div>

          {managing && (
            <div className="hero-promo-caption-editor">
              {editingTitle ? (
                <>
                  <input
                    type="text"
                    placeholder="Promo Code : TKRPride"
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="hero-promo-manage-btn"
                    disabled={savingTitle}
                    onClick={handleSaveTitle}
                  >
                    {savingTitle ? "Saving…" : "Save"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="hero-promo-manage-btn"
                  onClick={() => {
                    setTitleDraft(promoTitle);
                    setEditingTitle(true);
                  }}
                >
                  Edit Title (shown on all images)
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {error && <div style={{ color: "#ffb4a3", fontSize: 11, marginTop: 6 }}>{error}</div>}
    </div>
  );
}
