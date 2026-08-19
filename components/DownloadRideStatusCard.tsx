"use client";

import { useState } from "react";
import { downloadRideStatusCard } from "@/lib/canvasCardDownload";

export default function DownloadRideStatusCard({
  imageUrl,
  riderName,
  totalKm,
  terrain,
  state,
  destination,
  riderCount,
  rideTitle,
}: {
  imageUrl: string;
  riderName: string | null;
  totalKm: number | null;
  terrain: string | null;
  state: string | null;
  destination: string | null;
  riderCount: number;
  rideTitle: string;
}) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      const stats = [
        { label: "KM Covered", value: totalKm ? `${totalKm.toLocaleString("en-IN")} km` : "--" },
        { label: "Destination", value: destination || "--" },
        { label: "Riders", value: String(riderCount) },
      ];
      await downloadRideStatusCard({
        imageUrl,
        riderName,
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
    <div style={{ textAlign: "center", marginTop: 20 }}>
      <button type="button" className="btn btn-outline" onClick={handleDownload} disabled={downloading}>
        {downloading ? "Preparing…" : "Download for WhatsApp Status"}
      </button>
      {error && <div style={{ color: "#a3312a", fontSize: 12.5, marginTop: 8 }}>{error}</div>}
    </div>
  );
}
