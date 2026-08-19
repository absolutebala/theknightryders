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

async function drawLogoWatermark(ctx: CanvasRenderingContext2D, x: number, y: number, logoW = 300) {
  try {
    const logo = await loadImage(LOGO_URL);
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

function ensureGoogleFontLink(href: string) {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
}

/** Loads Poppins (stats/labels) and Dancing Script (signature-style rider name). */
async function loadRideCardFonts(): Promise<{ body: string; signature: string }> {
  try {
    ensureGoogleFontLink(
      "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Dancing+Script:wght@700&display=swap"
    );
    await Promise.all([
      document.fonts.load('800 40px "Poppins"'),
      document.fonts.load('700 40px "Dancing Script"'),
    ]);
    await document.fonts.ready;
    return { body: "Poppins", signature: "Dancing Script" };
  } catch {
    return { body: "Arial", signature: "cursive" };
  }
}

async function loadBrandFont(): Promise<string> {
  try {
    await document.fonts.load('800 40px "Montserrat"');
    await document.fonts.ready;
    return "Montserrat";
  } catch {
    return "Arial";
  }
}

export async function downloadPromoCard(opts: CardDownloadOptions): Promise<void> {
  const W = 800;
  const TITLE_H = opts.title ? 110 : 0;
  const FRAME = 34; // width of the outer dark mat / gold frame

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Measure message text height up front so the canvas can be sized correctly.
  ctx.font = "600 26px Arial";
  const messageLines = opts.message ? wrapText(ctx, opts.message, W - 80) : [];
  const MESSAGE_H = opts.message ? Math.max(140, messageLines.length * 36 + 60) : 0;

  const contentH =
    opts.imageShape === "rect"
      ? TITLE_H + Math.round((W * 4) / 3) + MESSAGE_H
      : TITLE_H + 480 + MESSAGE_H;

  canvas.width = W + FRAME * 2;
  canvas.height = contentH + FRAME * 2;

  // Dark mat background behind everything, then the actual card content
  // offset inward by the frame width -- all the drawing below is
  // unchanged from before, just shifted via translate() rather than
  // rewriting every coordinate.
  ctx.fillStyle = "#0c0e12";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(FRAME, FRAME);

  if (opts.imageShape === "rect") {
    const IMG_H = Math.round((W * 4) / 3);

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

    ctx.fillStyle = "#0c0e12";
    ctx.fillRect(0, 0, W, contentH);

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

  ctx.restore();

  // Premium gold double-frame: a thick metallic-gold outer line near the
  // canvas edge, a thin gold line further in, with the dark mat showing
  // between them -- same double-border language as a museum picture frame.
  const goldGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  goldGradient.addColorStop(0, "#b8892a");
  goldGradient.addColorStop(0.5, "#f0d98c");
  goldGradient.addColorStop(1, "#b8892a");

  ctx.strokeStyle = goldGradient;
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

  ctx.strokeStyle = "#f0c24e";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(FRAME - 10, FRAME - 10, canvas.width - (FRAME - 10) * 2, canvas.height - (FRAME - 10) * 2);

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

export type RideStatusCardOptions = {
  imageUrl: string;
  riderName: string | null; // only set when the viewer was actually on this ride
  stats: { label: string; value: string }[];
  filenameBase: string;
};

/**
 * WhatsApp Status card: the photo is shown at its own natural aspect ratio
 * (not cropped to fit a fixed box, unlike the homepage promo cards), with
 * a glossy title bar above and a glossy stats block below, each stat on
 * its own line.
 */
export async function downloadRideStatusCard(opts: RideStatusCardOptions): Promise<void> {
  const W = 800;
  const FRAME = 34;
  const TITLE_H = 130;
  const SIGNATURE_GAP = 90; // room reserved at the bottom of the photo for the rider's name overlay
  const STAT_LINE_H = 56;
  const { body: bodyFont, signature: signatureFont } = await loadRideCardFonts();

  const img = await loadImage(opts.imageUrl);
  const IMG_H = Math.round(W * (img.height / img.width));

  // Terrain/State dropped per request -- just KM Covered, Destination, Riders now.
  const statLines = opts.stats;
  const STATS_GAP_TOP = 40; // "enough spacing" between the photo/signature and the stats box
  const STATS_H = STATS_GAP_TOP + statLines.length * STAT_LINE_H + 40;

  const contentH = TITLE_H + IMG_H + STATS_H;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  canvas.width = W + FRAME * 2;
  canvas.height = contentH + FRAME * 2;

  ctx.fillStyle = "#0c0e12";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(FRAME, FRAME);

  // Glossy title bar.
  const titleGloss = ctx.createLinearGradient(0, 0, 0, TITLE_H);
  titleGloss.addColorStop(0, "#2a1f45");
  titleGloss.addColorStop(0.45, "#150f28");
  titleGloss.addColorStop(1, "#000");
  ctx.fillStyle = titleGloss;
  ctx.fillRect(0, 0, W, TITLE_H);
  ctx.fillStyle = "rgba(255,255,255,.08)";
  ctx.fillRect(0, 0, W, TITLE_H * 0.4);

  ctx.fillStyle = "#f0c24e";
  ctx.font = `800 44px "${bodyFont}"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,.5)";
  ctx.shadowBlur = 4;
  ctx.fillText("My Recent Ride", W / 2, TITLE_H / 2);
  ctx.shadowBlur = 0;

  // Photo, uncropped -- drawn at its natural aspect ratio.
  ctx.drawImage(img, 0, TITLE_H, W, IMG_H);

  // Logo watermark near the top-right of the photo, out of the way of
  // the rider's signature which sits at the bottom.
  await drawLogoWatermark(ctx, W, TITLE_H + 210, 220);

  // Rider name as a signature-style overlay across the bottom of the
  // photo -- 80% of the photo's width, centered, with a dark scrim
  // behind it so it stays legible over any photo.
  if (opts.riderName) {
    const scrimY = TITLE_H + IMG_H - SIGNATURE_GAP;
    const scrim = ctx.createLinearGradient(0, scrimY, 0, TITLE_H + IMG_H);
    scrim.addColorStop(0, "rgba(0,0,0,0)");
    scrim.addColorStop(1, "rgba(0,0,0,.55)");
    ctx.fillStyle = scrim;
    ctx.fillRect(0, scrimY, W, SIGNATURE_GAP);

    ctx.font = `700 52px "${signatureFont}"`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "rgba(0,0,0,.6)";
    ctx.shadowBlur = 6;
    // Constrain to 80% of the photo width, shrinking the font if a long name would overflow.
    const maxW = W * 0.8;
    let fontSize = 52;
    ctx.font = `700 ${fontSize}px "${signatureFont}"`;
    while (ctx.measureText(opts.riderName).width > maxW && fontSize > 24) {
      fontSize -= 2;
      ctx.font = `700 ${fontSize}px "${signatureFont}"`;
    }
    ctx.fillText(opts.riderName, W / 2, TITLE_H + IMG_H - SIGNATURE_GAP / 2 - 4);
    ctx.shadowBlur = 0;
  }

  // Glossy stats block, right-aligned.
  const statsY = TITLE_H + IMG_H;
  const statsGloss = ctx.createLinearGradient(0, statsY, 0, statsY + STATS_H);
  statsGloss.addColorStop(0, "#000");
  statsGloss.addColorStop(0.5, "#1a1032");
  statsGloss.addColorStop(1, "#000");
  ctx.fillStyle = statsGloss;
  ctx.fillRect(0, statsY, W, STATS_H);
  ctx.fillStyle = "rgba(255,255,255,.06)";
  ctx.fillRect(0, statsY, W, 6);

  const rightEdge = W - 40;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  statLines.forEach((stat, i) => {
    const lineY = statsY + STATS_GAP_TOP + i * STAT_LINE_H + STAT_LINE_H / 2;
    ctx.font = `600 19px "${bodyFont}"`;
    ctx.fillStyle = "rgba(240,194,78,.75)";
    ctx.fillText(stat.label.toUpperCase(), rightEdge, lineY - 14);
    ctx.font = `800 27px "${bodyFont}"`;
    ctx.fillStyle = "#f0c24e";
    ctx.fillText(stat.value, rightEdge, lineY + 12);
  });

  ctx.restore();

  // Same premium gold double-frame as the other cards.
  const goldGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  goldGradient.addColorStop(0, "#b8892a");
  goldGradient.addColorStop(0.5, "#f0d98c");
  goldGradient.addColorStop(1, "#b8892a");
  ctx.strokeStyle = goldGradient;
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
  ctx.strokeStyle = "#f0c24e";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(FRAME - 10, FRAME - 10, canvas.width - (FRAME - 10) * 2, canvas.height - (FRAME - 10) * 2);

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
