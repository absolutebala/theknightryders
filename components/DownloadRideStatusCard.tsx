"use client";

import { useEffect, useState } from "react";
import { downloadRideStatusCard, getRideStatusCardDataUrl } from "@/lib/canvasCardDownload";

export default function DownloadRideStatusCard({
  imageUrl,
  riderName,
  riderRideCount,
  totalKm,
  destination,
  riderCount,
  rideTitle,
  rideDisplayName,
  rideNumber,
}: {
  imageUrl: string;
  riderName: string | null;
  riderRideCount: number | null;
  totalKm: number | null;
  destination: string | null;
  riderCount: number;
  rideTitle: string;
  rideDisplayName: string;
  rideNumber: number | null;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const cardOptions = {
    imageUrl,
    rideDisplayName,
    rideNumber,
    riderName,
    riderRideCount,
    stats: [
      { label: "Distance", value: totalKm ? `${totalKm.toLocaleString("en-IN")} KM` : "--" },
      { label: "Destination", value: (destination || "--").toUpperCase() },
      { label: "Riders", value: String(riderCount) },
    ],
    filenameBase: `${rideTitle}_whatsapp_status`,
  };

  useEffect(() => {
    let cancelled = false;
    getRideStatusCardDataUrl(cardOptions)
      .then((url) => {
        if (!cancelled) setPreviewUrl(url);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Preview failed to generate.");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, rideDisplayName, rideNumber, riderName, riderRideCount, totalKm, destination, riderCount]);

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      await downloadRideStatusCard(cardOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed -- please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div style={{ width: 200, textAlign: "center" }}>
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt={rideDisplayName} style={{ width: "100%", display: "block" }} />
      ) : (
        <div
          style={{
            width: "100%",
            aspectRatio: "3/4",
            borderRadius: 14,
            background: "rgba(255,255,255,.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            color: "rgba(255,255,255,.6)",
          }}
        >
          Preparing preview…
        </div>
      )}

      <button
        type="button"
        className="hero-promo-manage-btn"
        onClick={handleDownload}
        disabled={downloading || !previewUrl}
        style={{ marginTop: 10 }}
      >
        {downloading ? "Preparing…" : "Download for WhatsApp Status"}
      </button>
      {error && <div style={{ color: "#e57373", fontSize: 10.5, marginTop: 6 }}>{error}</div>}
    </div>
  );
}
