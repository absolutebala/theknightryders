"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressImage, jpegFilename } from "@/lib/imageCompression";

export default function UpcomingRidePhotoEditor({
  upcomingRideId,
  existingPhotos,
  currentUrl,
}: {
  upcomingRideId: string;
  existingPhotos: { url: string; title: string }[];
  currentUrl: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(url: string) {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("update_upcoming_ride_photo", { target_id: upcomingRideId, new_url: url });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const compressed = await compressImage(file);
      const path = `upcoming-rides/${Date.now()}-${jpegFilename(file.name)}`;
      const { error: uploadError } = await supabase.storage.from("homepage").upload(path, compressed);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from("homepage").getPublicUrl(path);
      await save(publicUrlData.publicUrl);
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <div style={{ position: "absolute", top: 16, right: 16, zIndex: 2 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "rgba(255,255,255,.9)",
          border: "none",
          borderRadius: 20,
          padding: "6px 16px",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {currentUrl ? "Change Photo" : "Add Photo"}
      </button>

      {open && (
        <div
          style={{
            marginTop: 8,
            background: "#fff",
            borderRadius: 10,
            padding: 14,
            width: 280,
            boxShadow: "0 10px 30px rgba(0,0,0,.25)",
          }}
        >
          {error && <div style={{ color: "#a3312a", fontSize: 12, marginBottom: 8 }}>{error}</div>}
          <label style={{ display: "inline-block", fontSize: 12.5, color: "var(--cta-blue)", cursor: "pointer", marginBottom: 10 }}>
            {busy ? "Working…" : "Upload a new photo"}
            <input type="file" accept="image/*" onChange={handleUpload} disabled={busy} style={{ display: "none" }} />
          </label>
          {existingPhotos.length > 0 && (
            <>
              <div style={{ fontSize: 11.5, color: "var(--grey)", marginBottom: 6 }}>Or pick from a past ride:</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {existingPhotos.map((p) => (
                  <button
                    key={p.url}
                    type="button"
                    onClick={() => save(p.url)}
                    disabled={busy}
                    title={p.title}
                    style={{ padding: 0, border: "none", borderRadius: 6, overflow: "hidden", cursor: "pointer" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.title} style={{ width: "100%", height: 40, objectFit: "cover", display: "block" }} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
