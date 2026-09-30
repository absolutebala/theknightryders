"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DragPositionEditor from "./DragPositionEditor";
import { compressImage, jpegFilename } from "@/lib/imageCompression";
import { deleteStorageFileFromUrl } from "@/lib/supabaseStorage";

export default function UpcomingRidePhotoEditor({
  upcomingRideId,
  existingPhotos,
  currentUrl,
  currentPosition,
}: {
  upcomingRideId: string;
  existingPhotos: { url: string; title: string }[];
  currentUrl: string | null;
  currentPosition: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [position, setPosition] = useState(currentPosition);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pickedExistingUrl, setPickedExistingUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPickedExistingUrl(null);
    setPreviewUrl(URL.createObjectURL(file));
    setPosition(50);
  }

  function handlePickExisting(url: string) {
    setPendingFile(null);
    setPickedExistingUrl(url);
    setPreviewUrl(url);
    setPosition(50);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    try {
      let finalUrl = currentUrl;

      if (pendingFile) {
        const compressed = await compressImage(pendingFile);
        const path = `upcoming-rides/${Date.now()}-${jpegFilename(pendingFile.name)}`;
        const { error: uploadError } = await supabase.storage.from("homepage").upload(path, compressed);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from("homepage").getPublicUrl(path);
        finalUrl = publicUrlData.publicUrl;
      } else if (pickedExistingUrl) {
        finalUrl = pickedExistingUrl;
      }

      const { error: rpcError } = await supabase.rpc("update_upcoming_ride_photo", {
        target_id: upcomingRideId,
        new_url: finalUrl,
        new_position: position,
      });
      if (rpcError) throw rpcError;

      if (pendingFile && currentUrl) {
        await deleteStorageFileFromUrl(supabase, currentUrl);
      }

      setEditing(false);
      setPendingFile(null);
      setPickedExistingUrl(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setEditing(false);
    setPosition(currentPosition);
    setPendingFile(null);
    setPickedExistingUrl(null);
    setPreviewUrl(currentUrl);
    setError(null);
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setEditing((e) => !e)}
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

      {editing && (
        <div
          style={{
            marginTop: 8,
            background: "#fff",
            borderRadius: 10,
            padding: 14,
            width: 320,
            boxShadow: "0 10px 30px rgba(0,0,0,.25)",
          }}
        >
          {previewUrl && (
            <div style={{ marginBottom: 12 }}>
              <DragPositionEditor imageUrl={previewUrl} position={position} onChange={setPosition} frameHeight={170} />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: "none" }}
            id="upcoming-ride-photo-upload"
          />
          <label
            htmlFor="upcoming-ride-photo-upload"
            style={{ display: "inline-block", fontSize: 12.5, color: "var(--cta-blue)", cursor: "pointer", marginBottom: 10 }}
          >
            {previewUrl ? "Replace Photo" : "Upload a photo"}
          </label>

          {existingPhotos.length > 0 && (
            <>
              <div style={{ fontSize: 11.5, color: "var(--grey)", marginBottom: 6 }}>Or pick from a past ride:</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 12 }}>
                {existingPhotos.map((p) => (
                  <button
                    key={p.url}
                    type="button"
                    onClick={() => handlePickExisting(p.url)}
                    title={p.title}
                    style={{
                      padding: 0,
                      border: previewUrl === p.url ? "2px solid var(--cta-blue)" : "none",
                      borderRadius: 6,
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.title} style={{ width: "100%", height: 40, objectFit: "cover", display: "block" }} />
                  </button>
                ))}
              </div>
            </>
          )}

          {error && <div style={{ color: "#a3312a", fontSize: 12, marginBottom: 8 }}>{error}</div>}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="btn btn-amber"
              style={{ padding: "7px 16px", fontSize: 12 }}
              disabled={saving || !previewUrl}
              onClick={handleSave}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              style={{ padding: "7px 16px", fontSize: 12, background: "transparent", border: "1px solid #c7d3cf", borderRadius: 4, cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
