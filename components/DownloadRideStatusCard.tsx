"use client";

import { useState } from "react";
import { downloadRideStatusCard } from "@/lib/canvasCardDownload";

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
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      const stats = [
        { label: "Distance", value: totalKm ? `${totalKm.toLocaleString("en-IN")} KM` : "--" },
        { label: "Destination", value: (destination || "--").toUpperCase() },
        { label: "Riders", value: String(riderCount) },
      ];
      await downloadRideStatusCard({
        imageUrl,
        rideDisplayName,
        rideNumber,
        riderName,
        riderRideCount,
        stats,
        filenameBase: `${rideTitle}_whatsapp_status`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed -- please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="hero-promo-frame" style={{ width: 200 }}>
      <div className="hero-promo-birthday-title-row" style={{ fontSize: 14, lineHeight: 1.25 }}>
        Download for WhatsApp Status
      </div>
      <div className="hero-promo-image-area">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={rideTitle} />
      </div>
      <div style={{ padding: "10px 10px 12px", textAlign: "center", background: "rgba(255,255,255,.04)" }}>
        <button
          type="button"
          className="btn btn-amber"
          onClick={handleDownload}
          disabled={downloading}
          style={{ padding: "7px 16px", fontSize: 12, width: "100%" }}
        >
          {downloading ? "Preparing…" : "Download"}
        </button>
        {error && <div style={{ color: "#e57373", fontSize: 10.5, marginTop: 6 }}>{error}</div>}
      </div>
    </div>
  );
}
