"use client";

import { useEffect, useState } from "react";
import {
  downloadUpcomingRideCard,
  getUpcomingRideCardDataUrl,
  type UpcomingRideCardOptions,
} from "@/lib/upcomingRideCard";

export default function DownloadUpcomingRideCard(
  props: UpcomingRideCardOptions & { width?: number; linkHref?: string; dark?: boolean }
) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const { title, imageUrl, rideDate, endDate, approxKm, approxHours, slotsAvailable, cost } = props;

  useEffect(() => {
    let cancelled = false;
    getUpcomingRideCardDataUrl({ title, imageUrl, rideDate, endDate, approxKm, approxHours, slotsAvailable, cost })
      .then((url) => !cancelled && setPreviewUrl(url))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Preview failed to generate."));
    return () => {
      cancelled = true;
    };
  }, [title, imageUrl, rideDate, endDate, approxKm, approxHours, slotsAvailable, cost]);

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      await downloadUpcomingRideCard(props);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed -- please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div style={{ maxWidth: props.width ?? 340, margin: "0 auto", textAlign: "center" }}>
      {previewUrl ? (
        props.linkHref ? (
          <a href={props.linkHref} style={{ display: "block" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt={`${title} ride poster`} style={{ width: "100%", display: "block", borderRadius: 12 }} />
          </a>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={`${title} ride poster`} style={{ width: "100%", display: "block", borderRadius: 12 }} />
        )
      ) : (
        <div
          style={{
            width: "100%",
            aspectRatio: "2/3",
            borderRadius: 12,
            background: props.dark ? "rgba(255,255,255,.08)" : "var(--mint)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: props.dark ? "rgba(255,255,255,.6)" : "var(--grey)",
          }}
        >
          Preparing preview…
        </div>
      )}
      <button
        type="button"
        className={props.dark ? "hero-promo-manage-btn" : "btn btn-amber"}
        onClick={handleDownload}
        disabled={downloading || !previewUrl}
        style={props.dark ? { marginTop: 10 } : { marginTop: 12, padding: "10px 20px", fontSize: 13.5 }}
      >
        {downloading ? "Preparing…" : "Download for WhatsApp Status"}
      </button>
      {error && <div style={{ color: "#a3312a", fontSize: 12, marginTop: 6 }}>{error}</div>}
    </div>
  );
}
