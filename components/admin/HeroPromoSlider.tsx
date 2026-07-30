"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type PromoImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

type Props = {
  images: PromoImage[];
  isAdmin: boolean;
};

const SECTION_KEY = "hero_promo";

export default function HeroPromoSlider({ images, isAdmin }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [index, setIndex] = useState(0);
  const [managing, setManaging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-advance every 4.5s, pausing while the admin is managing photos.
  useEffect(() => {
    if (images.length <= 1 || managing) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [images.length, managing]);

  if (images.length === 0 && !isAdmin) return null;

  const current = images[index];

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

  return (
    <div className="hero-promo-slider">
      <div className="hero-promo-frame">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.image_url} alt="" />
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
                className={`hero-promo-dot ${i === index ? "hero-promo-dot-active" : ""}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}

        {isAdmin && managing && current && (
          <button
            type="button"
            aria-label="Remove image"
            className="hero-promo-remove"
            onClick={() => handleRemove(current.id)}
          >
            &#10005;
          </button>
        )}
      </div>

      {isAdmin && (
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
              <label htmlFor="hero-promo-upload" className="hero-promo-manage-btn" style={{ cursor: "pointer" }}>
                {uploading ? "Uploading…" : "+ Add"}
              </label>
            </>
          )}
        </div>
      )}
      {error && <div style={{ color: "#ffb4a3", fontSize: 11, marginTop: 6 }}>{error}</div>}
    </div>
  );
}
