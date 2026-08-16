"use client";

import { useState } from "react";

type FestivalCard = {
  holiday_key: string;
  holiday_name: string;
  image_url: string;
  holiday_date: string;
  wish_text: string | null;
};

const LOGO_URL =
  "https://hnetzvknrnvscvlnqoct.supabase.co/storage/v1/object/public/homepage/site-assets/tkr-logo-white.png";

function sanitizeFilename(name: string): string {
  return name.trim().replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let sx, sy, sw, sh;
  if (imgRatio > boxRatio) {
    sh = img.height;
    sw = sh * boxRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / boxRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0] ?? "";
  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + " " + words[i];
    if (ctx.measureText(testLine).width < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

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
      const W = 800;
      const TITLE_H = 110;
      const IMG_H = Math.round((W * 4) / 3);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      // Measure wish text height first so we can size the canvas correctly.
      ctx.font = "600 26px Arial";
      const wishLines = wrapText(ctx, wish, W - 80);
      const MESSAGE_H = Math.max(140, wishLines.length * 36 + 60);

      canvas.width = W;
      canvas.height = TITLE_H + IMG_H + MESSAGE_H;

      // Title bar
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, TITLE_H);
      ctx.fillStyle = "#f0c24e";
      ctx.font = "800 32px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(card.holiday_name, W / 2, TITLE_H / 2);

      // Image
      const img = await loadImage(card.image_url);
      drawImageCover(ctx, img, 0, TITLE_H, W, IMG_H);

      // Logo watermark, bottom-right of the image
      try {
        const logo = await loadImage(LOGO_URL);
        const logoW = 156;
        const logoH = (logo.height / logo.width) * logoW;
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.shadowColor = "rgba(0,0,0,.6)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.drawImage(logo, W - logoW - 14, TITLE_H + IMG_H - logoH - 14, logoW, logoH);
        ctx.restore();
      } catch {
        // Logo failing to load shouldn't block the whole download.
      }

      // Message bar
      ctx.fillStyle = "#000";
      ctx.fillRect(0, TITLE_H + IMG_H, W, MESSAGE_H);
      ctx.fillStyle = "#f0c24e";
      ctx.font = "600 26px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lineHeight = 36;
      const startY = TITLE_H + IMG_H + MESSAGE_H / 2 - ((wishLines.length - 1) * lineHeight) / 2;
      wishLines.forEach((line, i) => {
        ctx.fillText(line, W / 2, startY + i * lineHeight);
      });

      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Could not generate image");

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitizeFilename(card.holiday_name)}_the_knight_ryders.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
