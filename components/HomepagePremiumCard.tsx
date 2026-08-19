"use client";

import { useEffect, useState } from "react";
import { getPremiumCardDataUrl, downloadPremiumCard, type PremiumCardOptions } from "@/lib/canvasCardDownload";

export default function HomepagePremiumCard({
  options,
  width = 220,
  linkHref,
}: {
  options: PremiumCardOptions;
  width?: number;
  linkHref?: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const optionsKey = JSON.stringify(options);

  useEffect(() => {
    let cancelled = false;
    setPreviewUrl(null);
    getPremiumCardDataUrl(options)
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
  }, [optionsKey]);

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      await downloadPremiumCard(options);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed -- please try again.");
    } finally {
      setDownloading(false);
    }
  }

  const image = previewUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={previewUrl} alt={options.title} style={{ width: "100%", display: "block" }} />
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
  );

  return (
    <div style={{ width, textAlign: "center", margin: "0 auto" }}>
      {linkHref ? (
        <a href={linkHref} style={{ display: "block", textDecoration: "none" }}>
          {image}
        </a>
      ) : (
        image
      )}

      <button
        type="button"
        className="hero-promo-manage-btn"
        onClick={handleDownload}
        disabled={downloading || !previewUrl}
        style={{ marginTop: 10 }}
      >
        {downloading ? "Preparing…" : "Download This Card"}
      </button>
      {error && <div style={{ color: "#e57373", fontSize: 10.5, marginTop: 6 }}>{error}</div>}
    </div>
  );
}
