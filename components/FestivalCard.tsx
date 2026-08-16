"use client";

import { useState } from "react";
import { downloadPromoCard } from "@/lib/canvasCardDownload";

type FestivalCard = {
  holiday_key: string;
  holiday_name: string;
  image_url: string;
  holiday_date: string;
  wish_text: string | null;
};

export default function FestivalCard({ card }: { card: FestivalCard }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wish = card.wish_text || `Happy ${card.holiday_name}!`;
  const dateLabel = new Date(card.holiday_date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      await downloadPromoCard({
        title: card.holiday_name,
        imageUrl: card.image_url,
        imageShape: "rect",
        message: wish,
        filenameBase: card.holiday_name,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed -- please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="hero-promo-frame" style={{ position: "static", maxWidth: 320, margin: "0 auto" }}>
      <div className="hero-promo-birthday-title-row">{card.holiday_name}</div>
      <div className="hero-promo-image-area">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={card.image_url} alt={card.holiday_name} />
      </div>
      <div className="hero-promo-birthday-message">{wish}</div>
      <div style={{ padding: "12px 14px", textAlign: "center", background: "rgba(255,255,255,.04)" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", marginBottom: 8 }}>{dateLabel}</div>
        {error && <div style={{ fontSize: 11.5, color: "#e57373", marginBottom: 8 }}>{error}</div>}
        <button type="button" className="btn btn-amber" onClick={handleDownload} disabled={downloading} style={{ padding: "8px 20px", fontSize: 13 }}>
          {downloading ? "Preparing…" : "Download"}
        </button>
      </div>
    </div>
  );
}
