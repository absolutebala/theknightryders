"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type PromoImage = {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
};

export type BirthdayMember = {
  id: string;
  full_name: string | null;
  profile_photo_url: string | null;
};

type Props = {
  images: PromoImage[];
  isAdmin: boolean;
  showBirthdays: boolean;
  birthdayMembers: BirthdayMember[];
};

const SECTION_KEY = "hero_promo";

type Slide = { type: "image"; data: PromoImage } | { type: "birthday" };

export default function HeroPromoSlider({ images, isAdmin, showBirthdays, birthdayMembers }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [index, setIndex] = useState(0);
  const [managing, setManaging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [captionDrafts, setCaptionDrafts] = useState<Record<string, string>>({});
  const [savingBirthdayToggle, setSavingBirthdayToggle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const includeBirthdaySlide = showBirthdays && birthdayMembers.length > 0;
  const slides: Slide[] = [
    ...images.map((img): Slide => ({ type: "image", data: img })),
    ...(includeBirthdaySlide ? [{ type: "birthday" } as Slide] : []),
  ];

  // Auto-advance every 4.5s, pausing while the admin is managing photos.
  useEffect(() => {
    if (slides.length <= 1 || managing) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length, managing]);

  if (slides.length === 0 && !isAdmin) return null;

  const current = slides[index] as Slide | undefined;

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
    setIndex(0);
    router.refresh();
  }

  async function handleSaveCaption(imageId: string) {
    const supabase = createClient();
    const caption = captionDrafts[imageId] ?? "";
    const { error } = await supabase
      .from("homepage_images")
      .update({ caption: caption.trim() || null })
      .eq("id", imageId);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  async function toggleBirthdaySlide() {
    setSavingBirthdayToggle(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("homepage_content")
      .update({ show_birthdays: !showBirthdays })
      .eq("section_key", SECTION_KEY);
    setSavingBirthdayToggle(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="hero-promo-slider">
      <div className="hero-promo-frame">
        {current?.type === "image" && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.data.image_url} alt="" />
            {current.data.caption && (
              <div className="hero-promo-caption">{current.data.caption}</div>
            )}
          </>
        )}

        {current?.type === "birthday" && (
          <div className="hero-promo-birthday">
            <div className="hero-promo-birthday-title">&#127881; Happy Birthday</div>
            <div className="hero-promo-birthday-subtitle">
              Members celebrating their bday this month
            </div>
            <div className="hero-promo-birthday-list">
              {birthdayMembers.map((m) => (
                <div key={m.id} className="hero-promo-birthday-member">
                  {m.profile_photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.profile_photo_url} alt="" />
                  ) : (
                    <div className="hero-promo-birthday-noimg">
                      {(m.full_name ?? "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>{m.full_name ?? "Knight Ryder"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!current && isAdmin && <div className="hero-promo-empty">Upload a promo image</div>}

        {slides.length > 1 && (
          <div className="hero-promo-dots">
            {slides.map((s, i) => (
              <button
                key={s.type === "image" ? s.data.id : "birthday"}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                className={`hero-promo-dot ${i === index ? "hero-promo-dot-active" : ""}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}

        {isAdmin && managing && current?.type === "image" && (
          <button
            type="button"
            aria-label="Remove image"
            className="hero-promo-remove"
            onClick={() => handleRemove(current.data.id)}
          >
            &#10005;
          </button>
        )}
      </div>

      {isAdmin && (
        <div className="hero-promo-admin-panel">
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
            <>
              <label className="hero-promo-birthday-toggle">
                <input
                  type="checkbox"
                  checked={showBirthdays}
                  disabled={savingBirthdayToggle}
                  onChange={toggleBirthdaySlide}
                />
                Show birthday shoutout slide
              </label>

              {current?.type === "image" && (
                <div className="hero-promo-caption-editor">
                  <input
                    type="text"
                    placeholder="Caption, e.g. Promo Code : TKRPride"
                    value={captionDrafts[current.data.id] ?? current.data.caption ?? ""}
                    onChange={(e) =>
                      setCaptionDrafts((d) => ({ ...d, [current.data.id]: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    className="hero-promo-manage-btn"
                    onClick={() => handleSaveCaption(current.data.id)}
                  >
                    Save
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {error && <div style={{ color: "#ffb4a3", fontSize: 11, marginTop: 6 }}>{error}</div>}
    </div>
  );
}
