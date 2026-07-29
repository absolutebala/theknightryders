"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOwner && photos.length === 0) return null;

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

    const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
    const path = `${user.id}/gallery/${Date.now()}-${cleanName}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file);
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
    const { error } = await supabase.from("member_photos").delete().eq("id", photoId);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div className="elite-subsection-title" style={{ marginBottom: 0 }}>
          My Photos
        </div>
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
        <div className="elite-gallery-grid-v2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              style={{
                position: "relative",
                aspectRatio: "1/1",
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid rgba(212,175,55,.25)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.image_url}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {isOwner && (
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => handleRemove(photo.id)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(0,0,0,.7)",
                    color: "#fff",
                    fontSize: 10,
                    cursor: "pointer",
                  }}
                >
                  &#10005;
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
