"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressImage, jpegFilename } from "@/lib/imageCompression";
import { deleteStorageFileFromUrl } from "@/lib/supabaseStorage";
import HomepagePremiumCard from "@/components/HomepagePremiumCard";
import { type PremiumCardOptions } from "@/lib/canvasCardDownload";
import { getRideBadgeTier } from "@/lib/rideBadges";

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
  cost_per_person: number | null;
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
  holidayDate: string | null;
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
  holidayDate,
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

  function displayFullDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric" }).toUpperCase();
  }

  function getCardOptions(): PremiumCardOptions | null {
    if (promoMode === "birthday" && currentBirthday) {
      return {
        subtitle: "Happy Birthday",
        title: currentBirthday.full_name ?? "Knight Ryder",
        pillText: displayDate(currentBirthday.days_diff).toUpperCase(),
        imageUrl: currentBirthday.profile_photo_url ?? "/fallback/manivannan.jpeg",
        creditRow: { name: currentBirthday.full_name ?? "Knight Ryder", rideCount: currentBirthday.ride_count },
        bottomPills: null,
        bottomMessage: birthdayWish,
        filenameBase: `${currentBirthday.full_name ?? "member"}_birthday`,
      };
    }
    if (promoMode === "promoted" && currentPromoted) {
      const tier = getRideBadgeTier(currentPromoted.ride_count);
      return {
        subtitle: "Recently Promoted To",
        title: tier?.name ?? "Knight Ryder",
        pillText: displayFullDate(currentPromoted.tier_promoted_at),
        imageUrl: currentPromoted.profile_photo_url ?? "/fallback/manivannan.jpeg",
        creditRow: { name: currentPromoted.full_name ?? "Knight Ryder", rideCount: currentPromoted.ride_count },
        bottomPills: [{ label: "Rides Completed", value: String(currentPromoted.ride_count) }],
        bottomMessage: null,
        filenameBase: `${currentPromoted.full_name ?? "member"}_promoted`,
      };
    }
    if (promoMode === "holiday" && holidayImageUrl) {
      return {
        subtitle: "Celebrating",
        title: holidayName ?? "",
        pillText: holidayDate ? displayFullDate(holidayDate) : null,
        imageUrl: holidayImageUrl,
        creditRow: null,
        bottomPills: null,
        bottomMessage: holidayWish || (holidayName ? `Happy ${holidayName}!` : null),
        filenameBase: holidayName ?? "festival",
      };
    }
    if (promoMode === "upcoming-ride" && nextUpcomingRide) {
      const dateLabel =
        nextUpcomingRide.is_multi_day && nextUpcomingRide.end_date
          ? `${new Date(nextUpcomingRide.ride_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - ${new Date(nextUpcomingRide.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
          : new Date(nextUpcomingRide.ride_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      return {
        subtitle: "Our Upcoming Ride",
        title: nextUpcomingRide.title,
        pillText: displayFullDate(nextUpcomingRide.ride_date),
        imageUrl: nextUpcomingRide.hero_image_url ?? "/fallback/manivannan.jpeg",
        creditRow: null,
        bottomPills: [
          { label: "Place", value: nextUpcomingRide.place ?? "--" },
          { label: "Date", value: dateLabel },
          { label: "Cost", value: nextUpcomingRide.cost_per_person ? `₹${nextUpcomingRide.cost_per_person}` : "--" },
        ],
        bottomMessage: null,
        filenameBase: nextUpcomingRide.title,
      };
    }
    if (promoMode === "fallback") {
      return {
        subtitle: null,
        title: "The Journey Continues",
        pillText: null,
        imageUrl: "/fallback/manivannan.jpeg",
        creditRow: null,
        bottomPills: null,
        bottomMessage: null,
        filenameBase: "club_milestone",
      };
    }
    return null;
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

      {promoMode === "birthday" && getCardOptions() && (
        <div style={{ position: "relative" }}>
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
          <HomepagePremiumCard
            options={getCardOptions()!}
            linkHref={currentBirthday ? (currentBirthday.handle ? `/@${currentBirthday.handle}` : `/members/${currentBirthday.id}`) : undefined}
          />
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
      )}

      {promoMode === "promoted" && getCardOptions() && (
        <div style={{ position: "relative" }}>
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
          <HomepagePremiumCard
            options={getCardOptions()!}
            linkHref={currentPromoted ? (currentPromoted.handle ? `/@${currentPromoted.handle}` : `/members/${currentPromoted.id}`) : undefined}
          />
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
      )}

      {promoMode === "holiday" && getCardOptions() && <HomepagePremiumCard options={getCardOptions()!} />}

      {promoMode === "upcoming-ride" && getCardOptions() && (
        <HomepagePremiumCard options={getCardOptions()!} linkHref={`/rides/upcoming/${nextUpcomingRide!.slug}`} />
      )}

      {promoMode === "fallback" && getCardOptions() && <HomepagePremiumCard options={getCardOptions()!} />}

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
