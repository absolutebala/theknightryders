"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  rideId: string;
  gallery: string[];
  isAdmin: boolean;
};

export default function RideGalleryEditor({ rideId, gallery, isAdmin }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (gallery.length === 0 && !isAdmin) return null;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const supabase = createClient();

    const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
    const path = `rides/${rideId}/gallery-${Date.now()}-${cleanName}`;

    const { error: uploadError } = await supabase.storage.from("homepage").upload(path, file);
    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("homepage").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("rides")
      .update({ gallery: [...gallery, publicUrlData.publicUrl] })
      .eq("id", rideId);

    setUploading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  async function handleRemove(url: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("rides")
      .update({ gallery: gallery.filter((u) => u !== url) })
      .eq("id", rideId);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, color: "var(--navy)" }}>More From This Ride</h2>
        {isAdmin && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              style={{ display: "none" }}
              id="ride-gallery-upload"
            />
            <label
              htmlFor="ride-gallery-upload"
              className="btn btn-outline"
              style={{ padding: "6px 16px", fontSize: 12.5, cursor: "pointer" }}
            >
              {uploading ? "Uploading…" : "+ Add Photo"}
            </label>
          </>
        )}
      </div>

      {error && <div style={{ color: "#a3312a", fontSize: 12, marginBottom: 10 }}>{error}</div>}

      {gallery.length === 0 ? (
        <p style={{ color: "var(--grey)", fontSize: 14 }}>No extra photos added yet.</p>
      ) : (
        <div className="gallery-grid">
          {gallery.map((url) => (
            <figure key={url}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" />
              {isAdmin && (
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => handleRemove(url)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(0,0,0,.65)",
                    color: "#fff",
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  &#10005;
                </button>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
