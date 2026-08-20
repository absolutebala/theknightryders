import { getRideBadgeTier } from "./rideBadges";

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

/** Loads Poppins (stats/labels) and Caveat (signature-style rider name). */
async function loadRideCardFonts(): Promise<{ body: string; signature: string }> {
  try {
    ensureGoogleFontLink(
      "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Caveat:wght@700&display=swap"
    );
    await Promise.all([
      document.fonts.load('800 40px "Poppins"'),
      document.fonts.load('700 40px "Caveat"'),
    ]);
    await document.fonts.ready;
    return { body: "Poppins", signature: "Caveat" };
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

/**
 * Draws the same glossy tier-crown medallion shown elsewhere on the site
 * (member cards, leaderboard), centered at (cx, cy) with the given
 * diameter. Replicates the crown glyph from RideBadge.tsx via Path2D so
 * it's visually consistent rather than a generic icon.
 */
function drawCrownBadge(ctx: CanvasRenderingContext2D, cx: number, cy: number, diameter: number, rideCount: number) {
  const tier = getRideBadgeTier(rideCount);
  if (!tier) return;

  const r = diameter / 2;
  ctx.save();
  ctx.translate(cx, cy);

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = tier.colors.edge;
  ctx.fill();

  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.35, 0, 0, 0, r * 0.95);
  grad.addColorStop(0, tier.colors.shine);
  grad.addColorStop(0.55, tier.colors.base);
  grad.addColorStop(1, tier.colors.edge);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Crown glyph (same path as RideBadge.tsx), scaled and centered.
  const scale = (r * 0.85) / 12;
  ctx.save();
  ctx.translate(-12 * scale, -12 * scale);
  ctx.scale(scale, scale);
  const crownPath = new Path2D("M2 18 L2 9 L6.5 13 L9.5 5 L12 13 L14.5 5 L17.5 13 L22 9 L22 18 Z");
  ctx.fillStyle = "#fff";
  ctx.fill(crownPath);
  ctx.fillRect(2, 16.5, 20, 2.5);
  ctx.fillStyle = tier.colors.base;
  [6.5, 12, 17.5].forEach((gx) => {
    ctx.beginPath();
    ctx.arc(gx, gx === 12 ? 12 : 12.5, 1.3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  ctx.restore();
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

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Draws text with manual letter-spacing (more reliable across browsers than ctx.letterSpacing). */
function fillTextTracked(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, spacing: number) {
  const chars = text.split("");
  const widths = chars.map((c) => ctx.measureText(c).width);
  const totalWidth = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let x = cx - totalWidth / 2;
  const prevAlign = ctx.textAlign;
  ctx.textAlign = "left";
  chars.forEach((c, i) => {
    ctx.fillText(c, x, y);
    x += widths[i] + spacing;
  });
  ctx.textAlign = prevAlign;
}

export type PremiumCardOptions = {
  subtitle: string | null; // small tracked label above the title, e.g. "MY RECENT RIDE" / "HAPPY BIRTHDAY"
  title: string; // big gold heading -- ride name, member name, festival name, tier name
  pillText: string | null; // small top-right pill, e.g. a date or "RIDE #82"
  imageUrl: string;
  creditRow: { name: string; rideCount: number } | null; // name / crown / tier row, only for birthday & promoted
  bottomPills: { label: string; value: string }[] | null; // up to 3, mutually exclusive with bottomMessage
  bottomMessage: string | null; // wish / congrats text, mutually exclusive with bottomPills
  filenameBase: string;
};

/**
 * The one shared "premium card" renderer used for every downloadable card
 * on the site -- past-ride WhatsApp status cards, and all five homepage
 * promo card types (birthday, holiday, promoted, upcoming ride,
 * fallback). Layout: branded header (logo + wordmark) -> subtitle + title
 * + optional pill -> gold-framed uncropped photo with glossy highlight ->
 * optional credit row (name/crown/tier) -> optional stat pills OR a
 * single message -> tagline footer. All inside a rounded card with a
 * single gold border.
 */
async function buildPremiumCard(opts: PremiumCardOptions): Promise<HTMLCanvasElement> {
  const SCALE = 1.3;
  const FONT_SCALE = SCALE * 1.2;
  const s = (n: number) => Math.round(n * SCALE);
  const f = (n: number) => Math.round(n * FONT_SCALE);
  const bf = (n: number) => Math.round(n * FONT_SCALE * 1.2); // "below the image" text: credit row, stat pills/message, footer

  const W = s(700);
  const FRAME = s(30);
  const CORNER_RADIUS = s(26);
  const { body: bodyFont } = await loadRideCardFonts();

  const img = await loadImage(opts.imageUrl);
  const PHOTO_PAD = s(20);
  const photoW = W - PHOTO_PAD * 2;
  const photoH = Math.round(photoW * (img.height / img.width));

  const HEADER_H = s(176);
  const TITLE_H = s(128);
  const PHOTO_SECTION_H = photoH + PHOTO_PAD * 2;
  const RIDER_ROW_H = opts.creditRow ? s(74) : 0;
  const FOOTER_H = s(110);

  // Bottom section: either 3 stat pills (fixed height) or a wrapped
  // message (height depends on how many lines it wraps to).
  const measureCtx = document.createElement("canvas").getContext("2d")!;
  let bottomMessageLines: string[] = [];
  let BOTTOM_H = 0;
  if (opts.bottomPills && opts.bottomPills.length > 0) {
    BOTTOM_H = s(118);
  } else if (opts.bottomMessage) {
    measureCtx.font = `600 ${bf(18)}px "${bodyFont}"`;
    bottomMessageLines = wrapText(measureCtx, opts.bottomMessage, W - s(90));
    BOTTOM_H = Math.max(s(90), bottomMessageLines.length * f(28) + s(50));
  }

  const contentH = HEADER_H + TITLE_H + PHOTO_SECTION_H + RIDER_ROW_H + BOTTOM_H + FOOTER_H;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  canvas.width = W + FRAME * 2;
  canvas.height = contentH + FRAME * 2;

  const tier = opts.creditRow ? getRideBadgeTier(opts.creditRow.rideCount) : null;

  // Rounded-card clip so the corners come out transparent in the PNG.
  ctx.save();
  roundRectPath(ctx, 0, 0, canvas.width, canvas.height, CORNER_RADIUS + FRAME * 0.4);
  ctx.clip();

  // Deep purple-to-black background with a soft radial glow behind the header.
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#2a1a4a");
  bg.addColorStop(0.35, "#1a0f2e");
  bg.addColorStop(1, "#08060f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glow = ctx.createRadialGradient(canvas.width / 2, FRAME + s(80), 10, canvas.width / 2, FRAME + s(80), s(260));
  glow.addColorStop(0, "rgba(176,141,87,.35)");
  glow.addColorStop(1, "rgba(176,141,87,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.translate(FRAME, FRAME);
  let cursorY = 0;

  // --- Header: logo emblem + wordmark ---
  try {
    const logo = await loadImage(LOGO_URL);
    const logoW = f(110);
    const logoH = (logo.height / logo.width) * logoW;
    ctx.drawImage(logo, W / 2 - logoW / 2, cursorY + s(14), logoW, logoH);
    cursorY += logoH + s(14);
  } catch {
    cursorY += s(60);
  }
  ctx.font = `700 ${f(20)}px "${bodyFont}"`;
  ctx.fillStyle = "#e9c97a";
  ctx.textBaseline = "middle";
  fillTextTracked(ctx, "THE KNIGHT RYDERS", W / 2, cursorY + s(20), s(3));
  cursorY += s(46);

  const divider = ctx.createLinearGradient(0, 0, W, 0);
  divider.addColorStop(0, "rgba(233,201,122,0)");
  divider.addColorStop(0.5, "rgba(233,201,122,.6)");
  divider.addColorStop(1, "rgba(233,201,122,0)");
  ctx.fillStyle = divider;
  ctx.fillRect(s(30), cursorY, W - s(60), s(1.5));

  cursorY = HEADER_H;

  // --- Title section: subtitle + big title + optional pill ---
  if (opts.pillText) {
    ctx.font = `700 ${f(13)}px "${bodyFont}"`;
    const pillTextW = ctx.measureText(opts.pillText).width;
    const pillW = pillTextW + s(28);
    const pillH = s(28);
    const pillX = W - pillW - s(4);
    const pillY = s(8);
    roundRectPath(ctx, pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fillStyle = "rgba(255,255,255,.08)";
    ctx.fill();
    ctx.strokeStyle = "rgba(233,201,122,.5)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#e9c97a";
    ctx.textAlign = "center";
    ctx.fillText(opts.pillText, pillX + pillW / 2, pillY + pillH / 2 + 1);
  }

  if (opts.subtitle) {
    ctx.font = `600 ${f(18)}px "${bodyFont}"`;
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.textAlign = "center";
    fillTextTracked(ctx, opts.subtitle.toUpperCase(), W / 2, cursorY + s(26), s(3));
  }

  let titleFontSize = f(40);
  ctx.font = `800 ${titleFontSize}px "${bodyFont}"`;
  ctx.fillStyle = "#f0c24e";
  const titleText = opts.title.toUpperCase();
  const maxTitleW = W - s(60);
  while (ctx.measureText(titleText).width > maxTitleW && titleFontSize > f(22)) {
    titleFontSize -= 2;
    ctx.font = `800 ${titleFontSize}px "${bodyFont}"`;
  }
  ctx.fillText(titleText, W / 2, cursorY + s(76));

  cursorY = HEADER_H + TITLE_H;

  // --- Framed, uncropped photo with a glossy diagonal highlight ---
  const photoX = PHOTO_PAD;
  const photoY = cursorY + PHOTO_PAD;

  const goldFrame = ctx.createLinearGradient(photoX, photoY, photoX + photoW, photoY + photoH);
  goldFrame.addColorStop(0, "#b8892a");
  goldFrame.addColorStop(0.5, "#f0d98c");
  goldFrame.addColorStop(1, "#b8892a");
  ctx.strokeStyle = goldFrame;
  ctx.lineWidth = s(3);
  roundRectPath(ctx, photoX - s(4), photoY - s(4), photoW + s(8), photoH + s(8), s(10));
  ctx.stroke();

  ctx.save();
  roundRectPath(ctx, photoX, photoY, photoW, photoH, s(6));
  ctx.clip();
  ctx.drawImage(img, photoX, photoY, photoW, photoH);
  const gloss = ctx.createLinearGradient(photoX, photoY, photoX + photoW * 0.55, photoY + photoH * 0.55);
  gloss.addColorStop(0, "rgba(255,255,255,.22)");
  gloss.addColorStop(0.5, "rgba(255,255,255,0)");
  ctx.fillStyle = gloss;
  ctx.fillRect(photoX, photoY, photoW, photoH);
  ctx.restore();

  cursorY += PHOTO_SECTION_H;

  // --- Credit row: name (left) / crown (center) / tier (right) ---
  if (opts.creditRow && tier) {
    const rowY = cursorY + s(10);
    const rowH = RIDER_ROW_H - s(20);
    roundRectPath(ctx, 0, rowY, W, rowH, rowH / 2);
    ctx.fillStyle = "rgba(255,255,255,.06)";
    ctx.fill();
    ctx.strokeStyle = "rgba(233,201,122,.25)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = `700 ${bf(19)}px "${bodyFont}"`;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.fillText(opts.creditRow.name, s(26), rowY + rowH / 2 + 1);

    drawCrownBadge(ctx, W / 2, rowY + rowH / 2, bf(38), opts.creditRow.rideCount);

    ctx.font = `700 ${bf(15)}px "${bodyFont}"`;
    ctx.fillStyle = "#e9c97a";
    ctx.textAlign = "right";
    ctx.fillText(tier.name.toUpperCase(), W - s(26), rowY + rowH / 2 + 1);
  }

  cursorY += RIDER_ROW_H;

  // --- Bottom: either 3 stat pills, or a single wrapped message ---
  if (opts.bottomPills && opts.bottomPills.length > 0) {
    const gap = s(14);
    const items = opts.bottomPills.slice(0, 3);
    const pillW = (W - gap * (items.length - 1)) / items.length;
    const statsPillH = BOTTOM_H - s(14);
    items.forEach((stat, i) => {
      const px = i * (pillW + gap);
      const py = cursorY;
      roundRectPath(ctx, px, py, pillW, statsPillH, s(12));
      ctx.fillStyle = "rgba(255,255,255,.05)";
      ctx.fill();
      ctx.strokeStyle = "rgba(233,201,122,.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.font = `600 ${bf(12)}px "${bodyFont}"`;
      ctx.fillStyle = "rgba(255,255,255,.55)";
      fillTextTracked(ctx, stat.label.toUpperCase(), px + pillW / 2, py + statsPillH * 0.36, s(1));

      ctx.font = `800 ${stat.value.length > 9 ? bf(17) : bf(21)}px "${bodyFont}"`;
      ctx.fillStyle = "#f0c24e";
      ctx.fillText(stat.value, px + pillW / 2, py + statsPillH * 0.68);
    });
  } else if (opts.bottomMessage) {
    const py = cursorY;
    const boxH = BOTTOM_H - s(14);
    roundRectPath(ctx, 0, py, W, boxH, s(14));
    ctx.fillStyle = "rgba(255,255,255,.05)";
    ctx.fill();
    ctx.strokeStyle = "rgba(233,201,122,.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `600 ${bf(18)}px "${bodyFont}"`;
    ctx.fillStyle = "#f0c24e";
    const lineH = f(28);
    const startY = py + boxH / 2 - ((bottomMessageLines.length - 1) * lineH) / 2;
    bottomMessageLines.forEach((line, i) => ctx.fillText(line, W / 2, startY + i * lineH));
  }

  cursorY += BOTTOM_H;

  // --- Footer tagline ---
  const footDivider = ctx.createLinearGradient(0, 0, W, 0);
  footDivider.addColorStop(0, "rgba(233,201,122,0)");
  footDivider.addColorStop(0.5, "rgba(233,201,122,.4)");
  footDivider.addColorStop(1, "rgba(233,201,122,0)");
  ctx.fillStyle = footDivider;
  ctx.fillRect(s(30), cursorY, W - s(60), 1);

  ctx.font = `600 ${bf(13)}px "${bodyFont}"`;
  ctx.fillStyle = "rgba(233,201,122,.8)";
  ctx.textAlign = "center";
  fillTextTracked(ctx, "EVERY RIDE. A STORY.", W / 2, cursorY + FOOTER_H / 2 - s(18), s(3));

  ctx.font = `500 ${bf(9) * 2}px "${bodyFont}"`;
  ctx.fillStyle = "rgba(233,201,122,.5)";
  fillTextTracked(ctx, "THIS CARD IS GENERATED BY WWW.THEKNIGHTRYDERS.COM", W / 2, cursorY + FOOTER_H / 2 + s(26), s(0.5));

  ctx.restore(); // end rounded-card clip

  const borderGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  borderGrad.addColorStop(0, "#b8892a");
  borderGrad.addColorStop(0.5, "#f0d98c");
  borderGrad.addColorStop(1, "#b8892a");
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = s(2.5);
  roundRectPath(ctx, 3, 3, canvas.width - 6, canvas.height - 6, CORNER_RADIUS + FRAME * 0.4);
  ctx.stroke();

  return canvas;
}

export async function getPremiumCardDataUrl(opts: PremiumCardOptions): Promise<string> {
  const canvas = await buildPremiumCard(opts);
  return canvas.toDataURL("image/png");
}

export async function downloadPremiumCard(opts: PremiumCardOptions): Promise<void> {
  const canvas = await buildPremiumCard(opts);
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

// --- Backward-compatible ride-status-card API, now a thin adapter over the shared premium card renderer ---

export type RideStatusCardOptions = {
  imageUrl: string;
  rideDisplayName: string;
  rideNumber: number | null;
  riderName: string | null;
  riderRideCount: number | null;
  stats: { label: string; value: string }[];
  filenameBase: string;
};

function toPremiumCardOptions(opts: RideStatusCardOptions): PremiumCardOptions {
  return {
    subtitle: "Completed",
    title: opts.rideDisplayName,
    pillText: opts.rideNumber ? `RIDE #${opts.rideNumber}` : null,
    imageUrl: opts.imageUrl,
    creditRow: opts.riderName && opts.riderRideCount ? { name: opts.riderName, rideCount: opts.riderRideCount } : null,
    bottomPills: opts.stats,
    bottomMessage: null,
    filenameBase: opts.filenameBase,
  };
}

export async function getRideStatusCardDataUrl(opts: RideStatusCardOptions): Promise<string> {
  return getPremiumCardDataUrl(toPremiumCardOptions(opts));
}

export async function downloadRideStatusCard(opts: RideStatusCardOptions): Promise<void> {
  return downloadPremiumCard(toPremiumCardOptions(opts));
}
