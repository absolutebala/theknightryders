"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type PromoImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

export type BirthdayMember = {
  id: string;
  full_name: string | null;
  profile_photo_url: string | null;
  days_diff: number;
};

type PromoMode = "promo" | "birthday";

type Props = {
  images: PromoImage[];
  isAdmin: boolean;
  promoMode: PromoMode; // decided automatically upstream, this component just renders it
  promoTitle: string; // shared across all promo images, not per-image
  birthdayMembers: BirthdayMember[]; // already filtered to whichever set qualifies
};

const SECTION_KEY = "hero_promo";

function displayDate(daysDiff: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysDiff);
  return d.toLocaleDateString("en-IN", { month: "long", day: "numeric" });
}

export default function HeroPromoSlider({ images, isAdmin, promoMode, promoTitle, birthdayMembers }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [bdayIndex, setBdayIndex] = useState(0);
  const [managing, setManaging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(promoTitle);
  const [savingTitle, setSavingTitle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentImage = images[imgIndex];
  const currentBirthday = birthdayMembers[bdayIndex];

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
  }, [managing, promoMode, images.length, birthdayMembers.length]);

  if (promoMode === "promo" && images.length === 0 && !isAdmin) return null;
  if (promoMode === "birthday" && birthdayMembers.length === 0 && !isAdmin) return null;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const supabase = createClient();

    const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
    const path = `${SECTION_KEY}/${Date.now()}-${cleanName}`;

    const { error: uploadError } = await supabase.storage.from("homepage").upload(path, file);
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
    const { error } = await supabase.from("homepage_images").delete().eq("id", imageId);
    if (error) {
      setError(error.message);
      return;
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
              <div className="hero-promo-birthday-profile">
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
              </div>
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

          <div className="hero-promo-birthday-message">
            Wish you all the success and happiest life as we have on the road ;)
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="hero-promo-admin-panel">
          {promoMode === "birthday" && (
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.55)", textAlign: "center" }}>
              Birthday slide showing automatically right now (a member&apos;s birthday is today or
              within 2 days). You can still manage promo images below for when it's not active.
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
