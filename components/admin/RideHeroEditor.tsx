"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DragPositionEditor from "./DragPositionEditor";

type Props = {
  rideId: string;
  isAdmin: boolean;
  imageUrl: string | null;
  imagePosition: number;
};

export default function RideHeroEditor({ rideId, isAdmin, imageUrl, imagePosition }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [position, setPosition] = useState(imagePosition);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin) return null;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    try {
      let finalUrl = imageUrl;

      if (pendingFile) {
        const cleanName = pendingFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
        const path = `rides/${rideId}/${Date.now()}-${cleanName}`;
        const { error: uploadError } = await supabase.storage
          .from("homepage")
          .upload(path, pendingFile);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from("homepage").getPublicUrl(path);
        finalUrl = publicUrlData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("rides")
        .update({ hero_image_url: finalUrl, hero_image_position: position })
        .eq("id", rideId);
      if (updateError) throw updateError;

      setEditing(false);
      setPendingFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "absolute", top: 16, right: 16, zIndex: 20 }}>
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
        &#9998; Edit Photo
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
            id="ride-hero-upload"
          />
          <label
            htmlFor="ride-hero-upload"
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

          {error && <div style={{ color: "#a3312a", fontSize: 12, marginTop: 8 }}>{error}</div>}

          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
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
              onClick={() => {
                setEditing(false);
                setPosition(imagePosition);
                setPendingFile(null);
                setPreviewUrl(imageUrl);
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
