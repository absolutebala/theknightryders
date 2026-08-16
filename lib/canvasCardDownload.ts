const LOGO_URL =
  "https://hnetzvknrnvscvlnqoct.supabase.co/storage/v1/object/public/homepage/site-assets/tkr-logo-white.png";

export type CardDownloadOptions = {
  title: string | null; // top label, e.g. "Happy Birthday" / "Diwali" / "Upcoming Rides"
  imageUrl: string | null;
  imageShape: "rect" | "circle";
  subtitle?: string | null; // person's name, shown under a circular photo
  message: string | null; // wish / congrats / ride details, bottom bar
  filenameBase: string; // gets sanitized and suffixed automatically
};

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

async function drawLogoWatermark(ctx: CanvasRenderingContext2D, x: number, y: number) {
  try {
    const logo = await loadImage(LOGO_URL);
    const logoW = 156;
    const logoH = (logo.height / logo.width) * logoW;
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.shadowColor = "rgba(0,0,0,.6)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.drawImage(logo, x - logoW - 14, y - logoH - 14, logoW, logoH);
    ctx.restore();
  } catch {
    // Logo failing to load shouldn't block the whole download.
  }
}

export async function downloadPromoCard(opts: CardDownloadOptions): Promise<void> {
  const W = 800;
  const TITLE_H = opts.title ? 110 : 0;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Measure message text height up front so the canvas can be sized correctly.
  ctx.font = "600 26px Arial";
  const messageLines = opts.message ? wrapText(ctx, opts.message, W - 80) : [];
  const MESSAGE_H = opts.message ? Math.max(140, messageLines.length * 36 + 60) : 0;

  if (opts.imageShape === "rect") {
    const IMG_H = Math.round((W * 4) / 3);
    canvas.width = W;
    canvas.height = TITLE_H + IMG_H + MESSAGE_H;

    if (opts.title) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, TITLE_H);
      ctx.fillStyle = "#f0c24e";
      ctx.font = "800 32px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(opts.title, W / 2, TITLE_H / 2);
    }

    if (opts.imageUrl) {
      const img = await loadImage(opts.imageUrl);
      drawImageCover(ctx, img, 0, TITLE_H, W, IMG_H);
      await drawLogoWatermark(ctx, W, TITLE_H + IMG_H);
    }

    if (opts.message) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, TITLE_H + IMG_H, W, MESSAGE_H);
      ctx.fillStyle = "#f0c24e";
      ctx.font = "600 26px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lineHeight = 36;
      const startY = TITLE_H + IMG_H + MESSAGE_H / 2 - ((messageLines.length - 1) * lineHeight) / 2;
      messageLines.forEach((line, i) => ctx.fillText(line, W / 2, startY + i * lineHeight));
    }
  } else {
    // Circular photo layout: dark card, title bar, centered circular
    // photo with the person's name beneath it, then the message bar.
    const PHOTO_AREA_H = 480;
    canvas.width = W;
    canvas.height = TITLE_H + PHOTO_AREA_H + MESSAGE_H;

    ctx.fillStyle = "#0c0e12";
    ctx.fillRect(0, 0, W, canvas.height);

    if (opts.title) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, TITLE_H);
      ctx.fillStyle = "#f0c24e";
      ctx.font = "800 32px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(opts.title, W / 2, TITLE_H / 2);
    }

    const circleR = 150;
    const circleCx = W / 2;
    const circleCy = TITLE_H + 190;

    if (opts.imageUrl) {
      const img = await loadImage(opts.imageUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(circleCx, circleCy, circleR, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      drawImageCover(ctx, img, circleCx - circleR, circleCy - circleR, circleR * 2, circleR * 2);
      ctx.restore();
      ctx.strokeStyle = "#f0c24e";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(circleCx, circleCy, circleR, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (opts.subtitle) {
      ctx.fillStyle = "#fff";
      ctx.font = "800 28px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(opts.subtitle, W / 2, circleCy + circleR + 45);
    }

    if (opts.message) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, TITLE_H + PHOTO_AREA_H, W, MESSAGE_H);
      ctx.fillStyle = "#f0c24e";
      ctx.font = "600 26px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lineHeight = 36;
      const startY = TITLE_H + PHOTO_AREA_H + MESSAGE_H / 2 - ((messageLines.length - 1) * lineHeight) / 2;
      messageLines.forEach((line, i) => ctx.fillText(line, W / 2, startY + i * lineHeight));
    }

    await drawLogoWatermark(ctx, W, TITLE_H + PHOTO_AREA_H);
  }

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not generate image");

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sanitizeFilename(opts.filenameBase)}_the_knight_ryders.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
