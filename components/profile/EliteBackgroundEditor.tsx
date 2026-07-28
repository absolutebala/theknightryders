"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DragPositionEditor from "@/components/admin/DragPositionEditor";

type Props = {
  memberId: string;
  backgroundSource: "auto" | "custom";
  customImageUrl: string | null;
  customImagePosition: number;
  latestRideImageUrl: string | null;
};

export default function EliteBackgroundEditor({
  memberId,
  backgroundSource,
  customImageUrl,
  customImagePosition,
  latestRideImageUrl,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [mode, setMode] = useState<"auto" | "custom">(backgroundSource);
  const [position, setPosition] = useState(customImagePosition);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(customImageUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      let finalUrl = customImageUrl;

      if (mode === "custom" && pendingFile) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("You need to be signed in.");

        const cleanName = pendingFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
        const path = `${user.id}/background/${Date.now()}-${cleanName}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, pendingFile);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
        finalUrl = publicUrlData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("members")
        .update({
          background_source: mode,
          background_image_url: finalUrl,
          background_image_position: position,
        })
        .eq("id", memberId);
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
    <div style={{ position: "absolute", top: 20, left: 24, zIndex: 20 }}>
      <button
        type="button"
        onClick={() => setEditing((e) => !e)}
        style={{
          background: "rgba(8,10,15,.7)",
          color: "#d4af37",
          border: "1px solid rgba(212,175,55,.5)",
          borderRadius: 6,
          padding: "8px 16px",
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        &#9998; Change Background
      </button>

      {editing && (
        <div
          style={{
            marginTop: 10,
            background: "#12161f",
            border: "1px solid rgba(212,175,55,.3)",
            borderRadius: 12,
            padding: 18,
            width: 340,
            boxShadow: "0 10px 30px rgba(0,0,0,.5)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#e8e8e8" }}>
              <input type="radio" name="bg-mode" checked={mode === "auto"} onChange={() => setMode("auto")} />
              Latest ride photo
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#e8e8e8" }}>
              <input type="radio" name="bg-mode" checked={mode === "custom"} onChange={() => setMode("custom")} />
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
                  <DragPositionEditor imageUrl={previewUrl} position={position} onChange={setPosition} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
                id="elite-bg-upload"
              />
              <label
                htmlFor="elite-bg-upload"
                style={{
                  display: "inline-block",
                  padding: "6px 14px",
                  fontSize: 12,
                  cursor: "pointer",
                  background: "transparent",
                  color: "#d4af37",
                  border: "1px solid rgba(212,175,55,.5)",
                  borderRadius: 6,
                  marginBottom: 12,
                }}
              >
                {previewUrl ? "Replace Photo" : "Choose Photo"}
              </label>
            </>
          )}

          {error && <div style={{ color: "#e08a7d", fontSize: 12, marginTop: 8 }}>{error}</div>}

          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button
              type="button"
              disabled={saving || (mode === "custom" && !previewUrl)}
              onClick={handleSave}
              style={{
                padding: "7px 18px",
                fontSize: 12,
                fontWeight: 700,
                background: "linear-gradient(135deg, #d4af37, #8a6d1c)",
                color: "#000",
                border: "none",
                borderRadius: 20,
                cursor: "pointer",
              }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setMode(backgroundSource);
                setPosition(customImagePosition);
                setPendingFile(null);
                setPreviewUrl(customImageUrl);
              }}
              style={{
                padding: "7px 18px",
                fontSize: 12,
                background: "transparent",
                border: "1px solid rgba(255,255,255,.25)",
                borderRadius: 20,
                color: "#e8e8e8",
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
