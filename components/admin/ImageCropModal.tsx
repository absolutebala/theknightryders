"use client";

import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImageBlob, type CropPixels } from "@/lib/imageCropUtils";

export default function ImageCropModal({
  imageSrc,
  aspect = 3 / 4,
  onCancel,
  onDone,
}: {
  imageSrc: string;
  aspect?: number;
  onCancel: () => void;
  onDone: (blob: Blob) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState<CropPixels | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_area: unknown, areaPixels: CropPixels) => {
    setCroppedPixels(areaPixels);
  }, []);

  async function handleConfirm() {
    if (!croppedPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedPixels);
      onDone(blob);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.75)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0c0e12",
          borderRadius: 14,
          padding: 20,
          width: "100%",
          maxWidth: 420,
        }}
      >
        <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
          Crop to 3:4 for a consistent card size
        </div>

        <div style={{ position: "relative", width: "100%", height: 380, background: "#000", borderRadius: 8, overflow: "hidden" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div style={{ margin: "14px 0" }}>
          <label style={{ color: "rgba(255,255,255,.6)", fontSize: 11.5, display: "block", marginBottom: 6 }}>Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            style={{ padding: "9px 18px", background: "transparent", border: "1px solid rgba(255,255,255,.3)", borderRadius: 6, cursor: "pointer", color: "#fff", fontSize: 13.5 }}
          >
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} disabled={saving || !croppedPixels} className="btn btn-amber">
            {saving ? "Saving…" : "Use This Crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
