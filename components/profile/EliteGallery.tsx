"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressImage, jpegFilename } from "@/lib/imageCompression";
import { deleteStorageFileFromUrl } from "@/lib/supabaseStorage";

export type MemberPhoto = {
  id: string;
  image_url: string;
  sort_order: number;
};

type Props = {
  memberId: string;
  isOwner: boolean;
  photos: MemberPhoto[];
};

const MAX_PHOTOS = 5;

export default function EliteGallery({ memberId, isOwner, photos }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOwner && photos.length === 0) return null;

  const current = photos[index];

  function goPrev() {
    setIndex((i) => (i > 0 ? i - 1 : i));
  }
  function goNext() {
    setIndex((i) => (i < photos.length - 1 ? i + 1 : i));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photos.length >= MAX_PHOTOS) {
      setError(`You can upload up to ${MAX_PHOTOS} photos.`);
      return;
    }

    setUploading(true);
    setError(null);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUploading(false);
      setError("You need to be signed in to upload.");
      return;
    }

    const compressed = await compressImage(file);
    const cleanName = jpegFilename(file.name.replace(/[^a-zA-Z0-9.\-_]/g, ""));
    const path = `${user.id}/gallery/${Date.now()}-${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, compressed, { contentType: "image/jpeg" });
    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const nextSort = photos.length > 0 ? Math.max(...photos.map((p) => p.sort_order)) + 1 : 0;

    const { error: insertError } = await supabase.from("member_photos").insert({
      member_id: memberId,
      image_url: publicUrlData.publicUrl,
      sort_order: nextSort,
    });

    setUploading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  async function handleRemove(photoId: string) {
    const supabase = createClient();
    const photoToRemove = photos.find((p) => p.id === photoId);
    const { error } = await supabase.from("member_photos").delete().eq("id", photoId);
    if (error) {
      setError(error.message);
      return;
    }
    if (photoToRemove) {
      await deleteStorageFileFromUrl(supabase, photoToRemove.image_url);
    }
    setIndex((i) => Math.max(0, i - 1));
    router.refresh();
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: 14,
          minHeight: 24,
        }}
      >
        {isOwner && photos.length < MAX_PHOTOS && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              style={{ display: "none" }}
              id="elite-gallery-upload"
            />
            <label
              htmlFor="elite-gallery-upload"
              style={{
                fontSize: 11.5,
                color: "#d4af37",
                border: "1px solid rgba(212,175,55,.5)",
                borderRadius: 6,
                padding: "5px 12px",
                cursor: "pointer",
              }}
            >
              {uploading ? "Uploading…" : "+ Add Photo"}
            </label>
          </>
        )}
      </div>

      {error && <div style={{ color: "#e08a7d", fontSize: 12, marginBottom: 10 }}>{error}</div>}

      {photos.length === 0 ? (
        <p style={{ color: "#8b929c", fontSize: 13 }}>No photos added yet.</p>
      ) : (
        <div className="elite-slider">
          <div className="elite-slider-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.image_url}
              alt=""
              onClick={() => setLightboxOpen(true)}
            />
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  className="elite-slider-nav elite-prev"
                  onClick={goPrev}
                  disabled={index === 0}
                >
                  &#8249;
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  className="elite-slider-nav elite-next"
                  onClick={goNext}
                  disabled={index === photos.length - 1}
                >
                  &#8250;
                </button>
              </>
            )}
            {isOwner && (
              <button
                type="button"
                aria-label="Remove photo"
                className="elite-slider-remove"
                onClick={() => handleRemove(current.id)}
              >
                &#10005;
              </button>
            )}
          </div>
          {photos.length > 1 && (
            <div className="elite-slider-dots">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`Show photo ${i + 1}`}
                  className={`elite-slider-dot ${i === index ? "elite-active" : ""}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {lightboxOpen && current && (
        <div className="elite-lightbox-backdrop" onClick={() => setLightboxOpen(false)}>
          <button
            type="button"
            aria-label="Close"
            className="elite-lightbox-close"
            onClick={() => setLightboxOpen(false)}
          >
            &#10005;
          </button>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                className="elite-lightbox-nav elite-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                disabled={index === 0}
              >
                &#8249;
              </button>
              <button
                type="button"
                aria-label="Next photo"
                className="elite-lightbox-nav elite-next"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                disabled={index === photos.length - 1}
              >
                &#8250;
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.image_url}
            alt=""
            className="elite-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
