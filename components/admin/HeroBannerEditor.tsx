"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DragPositionEditor from "./DragPositionEditor";
import { compressImage, jpegFilename } from "@/lib/imageCompression";
import { deleteStorageFileFromUrl } from "@/lib/supabaseStorage";

type Props = {
  isAdmin: boolean;
  heroSource: "auto" | "custom";
  customImageUrl: string | null;
  customImagePosition: number;
  latestRideImageUrl: string | null;
};

export default function HeroBannerEditor({
  isAdmin,
  heroSource,
  customImageUrl,
  customImagePosition,
  latestRideImageUrl,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [mode, setMode] = useState<"auto" | "custom">(heroSource);
  const [position, setPosition] = useState(customImagePosition);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(customImageUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin) return null;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMode("custom");
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    try {
      if (mode === "custom") {
        let finalUrl = customImageUrl;

        if (pendingFile) {
          const compressed = await compressImage(pendingFile);
          const cleanName = jpegFilename(pendingFile.name.replace(/[^a-zA-Z0-9.\-_]/g, ""));
          const path = `hero/${Date.now()}-${cleanName}`;
          const { error: uploadError } = await supabase.storage
            .from("homepage")
            .upload(path, compressed, { contentType: "image/jpeg" });
          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage.from("homepage").getPublicUrl(path);
          finalUrl = publicUrlData.publicUrl;

          // Single-image slot: clear any previous hero image rows, then insert the new one.
          await supabase.from("homepage_images").delete().eq("section_key", "hero");
          const { error: insertError } = await supabase.from("homepage_images").insert({
            section_key: "hero",
            image_url: finalUrl,
            image_position: position,
            sort_order: 0,
          });
          if (insertError) throw insertError;

          if (customImageUrl) {
            await deleteStorageFileFromUrl(supabase, customImageUrl);
          }
        } else if (finalUrl) {
          // No new upload, just update the position of the existing custom image.
          const { error: updateError } = await supabase
            .from("homepage_images")
            .update({ image_position: position })
            .eq("section_key", "hero");
          if (updateError) throw updateError;
        }
      }

      const { error: contentError } = await supabase
        .from("homepage_content")
        .update({ hero_source: mode })
        .eq("section_key", "hero");
      if (contentError) throw contentError;

      setEditing(false);
      setPendingFile(null);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Something went wrong.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "absolute", top: 100, right: 24, zIndex: 20 }}>
      <button
        type="button"
        onClick={() => setEditing((e) => !e)}
        className="btn"
        style={{
          background: "rgba(0,0,0,.55)",
          color: "var(--white)",
          border: "1px solid rgba(255,255,255,.4)",
          padding: "8px 16px",
          fontSize: 12,
        }}
      >
        &#9998; Edit Banner
      </button>

      {editing && (
        <div
          style={{
            marginTop: 10,
            background: "var(--white)",
            borderRadius: 12,
            padding: 18,
            width: 340,
            boxShadow: "0 10px 30px rgba(0,0,0,.3)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--dark)" }}>
              <input
                type="radio"
                name="hero-mode"
                checked={mode === "auto"}
                onChange={() => setMode("auto")}
              />
              Featured photo from most recent ride
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--dark)" }}>
              <input
                type="radio"
                name="hero-mode"
                checked={mode === "custom"}
                onChange={() => setMode("custom")}
              />
              Upload custom photo
            </label>
          </div>

          {mode === "auto" && latestRideImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={latestRideImageUrl}
              alt="Latest ride"
              style={{ width: "100%", borderRadius: 8, marginBottom: 10 }}
            />
          )}

          {mode === "custom" && (
            <>
              {previewUrl && (
                <div style={{ marginBottom: 12 }}>
                  <DragPositionEditor
                    imageUrl={previewUrl}
                    position={position}
                    onChange={setPosition}
                  />
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
                id="hero-upload"
              />
              <label
                htmlFor="hero-upload"
                className="btn btn-outline"
                style={{
                  display: "inline-block",
                  padding: "6px 14px",
                  fontSize: 12,
                  cursor: "pointer",
                  background: "transparent",
                  color: "var(--navy)",
                  border: "1px solid var(--cta-blue)",
                  marginBottom: 12,
                }}
              >
                {previewUrl ? "Replace Photo" : "Choose Photo"}
              </label>
            </>
          )}

          {error && <div style={{ color: "#a3312a", fontSize: 12, marginTop: 8 }}>{error}</div>}

          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button
              type="button"
              className="btn btn-amber"
              style={{ padding: "7px 16px", fontSize: 12 }}
              disabled={saving || (mode === "custom" && !previewUrl)}
              onClick={handleSave}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setMode(heroSource);
                setPosition(customImagePosition);
                setPendingFile(null);
                setPreviewUrl(customImageUrl);
              }}
              style={{
                padding: "7px 16px",
                fontSize: 12,
                background: "transparent",
                border: "1px solid #c7d3cf",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
