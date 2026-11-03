// WhatsApp-status card for UPCOMING rides, drawn on a canvas in the browser.
// Layout follows the club's poster template: logo, two-tone ride name, date,
// approx distance / duration, slots available, ride cost, website.

const LOGO_URL =
  "https://hnetzvknrnvscvlnqoct.supabase.co/storage/v1/object/public/homepage/site-assets/tkr-logo-white.png";

const AMBER = "#f9b81a";
const NAVY = "#06143c";
const W = 1024;
const H = 1536;
const SCALE = 1080 / 1024;

export type UpcomingRideCardOptions = {
  title: string;
  imageUrl: string | null;
  rideDate: string; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD, multi-day rides
  approxKm: string | null;
  approxHours: string | null;
  slotsAvailable: number | null;
  cost: number | null;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  const ir = img.width / img.height;
  const br = W / H;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (ir > br) {
    sw = img.height * br;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / br;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
}

async function loadFonts(): Promise<string> {
  try {
    const href =
      "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,600;0,700;1,700;1,800&display=swap";
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
    await Promise.all([
      document.fonts.load('700 40px "Poppins"'),
      document.fonts.load('italic 800 40px "Poppins"'),
      document.fonts.load('italic 700 40px "Poppins"'),
    ]);
    await document.fonts.ready;
    return "Poppins";
  } catch {
    return "Arial";
  }
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export function formatCardDateRange(start: string, end: string | null): string {
  const [sy, sm, sd] = start.split("-").map(Number);
  if (!end || end === start) return `${MONTHS[sm - 1]} ${sd}, ${sy}`;
  const [ey, em, ed] = end.split("-").map(Number);
  const s = sy === ey ? `${MONTHS[sm - 1]} ${sd}` : `${MONTHS[sm - 1]} ${sd}, ${sy}`;
  return `${s} to ${MONTHS[em - 1]} ${ed}, ${ey}`;
}

/** Shrinks the font size until the text fits maxWidth. */
function fitFont(ctx: CanvasRenderingContext2D, text: string, font: (px: number) => string, startPx: number, maxWidth: number) {
  let px = startPx;
  ctx.font = font(px);
  while (ctx.measureText(text).width > maxWidth && px > 20) {
    px -= 2;
    ctx.font = font(px);
  }
  return px;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function iconCalendar(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.strokeStyle = "#fff";
  ctx.fillStyle = "#fff";
  ctx.lineWidth = 3;
  roundRect(ctx, cx - 18, cy - 16, 36, 34, 5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 18, cy - 5);
  ctx.lineTo(cx + 18, cy - 5);
  ctx.moveTo(cx - 9, cy - 22);
  ctx.lineTo(cx - 9, cy - 12);
  ctx.moveTo(cx + 9, cy - 22);
  ctx.lineTo(cx + 9, cy - 12);
  ctx.stroke();
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) ctx.fillRect(cx - 13 + c * 8, cy + 2 + r * 8, 3.5, 3.5);
  ctx.restore();
}

function iconRoad(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy + 26);
  ctx.lineTo(cx - 28, cy - 26);
  ctx.moveTo(cx + 12, cy + 26);
  ctx.lineTo(cx + 28, cy - 26);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy + 24);
  ctx.lineTo(cx, cy - 26);
  ctx.setLineDash([8, 7]);
  ctx.stroke();
  ctx.restore();
}

function iconClock(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 28, 0, Math.PI * 2);
  ctx.moveTo(cx, cy - 16);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx + 14, cy + 10);
  ctx.stroke();
  ctx.restore();
}

function iconPeople(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2.8;
  const person = (x: number, y: number, r: number, w: number) => {
    ctx.beginPath();
    ctx.arc(x, y - r - 3, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - w, y + 16);
    ctx.quadraticCurveTo(x - w, y - 2, x, y - 2);
    ctx.quadraticCurveTo(x + w, y - 2, x + w, y + 16);
    ctx.stroke();
  };
  person(cx - 22, cy + 4, 6, 13);
  person(cx + 22, cy + 4, 6, 13);
  person(cx, cy - 2, 8, 17);
  ctx.restore();
}

async function buildCard(opts: UpcomingRideCardOptions): Promise<HTMLCanvasElement> {
  const font = await loadFonts();
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(W * SCALE);
  canvas.height = Math.round(H * SCALE);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.scale(SCALE, SCALE);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Background: ride photo (or club navy), darkened top and bottom for legibility
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, W, H);
  if (opts.imageUrl) {
    try {
      drawCover(ctx, await loadImage(opts.imageUrl));
    } catch {
      /* fall back to navy */
    }
  }
  const top = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  top.addColorStop(0, "rgba(6,20,60,.94)");
  top.addColorStop(0.6, "rgba(6,20,60,.55)");
  top.addColorStop(1, "rgba(6,20,60,0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, H);
  const bottom = ctx.createLinearGradient(0, H * 0.58, 0, H);
  bottom.addColorStop(0, "rgba(6,20,60,0)");
  bottom.addColorStop(0.5, "rgba(6,20,60,.7)");
  bottom.addColorStop(1, "rgba(6,20,60,.92)");
  ctx.fillStyle = bottom;
  ctx.fillRect(0, 0, W, H);

  // Logo
  try {
    const logo = await loadImage(LOGO_URL);
    const lw = 540;
    const lh = (logo.height / logo.width) * lw;
    ctx.save();
    ctx.shadowColor = "rgba(255,255,255,.25)";
    ctx.shadowBlur = 24;
    ctx.drawImage(logo, W / 2 - lw / 2, 95, lw, lh);
    ctx.restore();
  } catch {
    ctx.fillStyle = "#fff";
    ctx.font = `800 40px ${font}`;
    ctx.fillText("THE KNIGHT RYDERS", W / 2, 260);
  }

  // Ride name: first word white, the rest amber
  const words = opts.title.trim().toUpperCase().split(/\s+/);
  const line1 = words.length > 1 ? words[0] : words[0] ?? "";
  const line2 = words.length > 1 ? words.slice(1).join(" ") : "";
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.45)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;
  const f800 = (px: number) => `italic 800 ${px}px ${font}`;
  fitFont(ctx, line1, f800, 130, 860);
  ctx.fillStyle = "#fff";
  ctx.fillText(line1, W / 2, line2 ? 490 : 540);
  if (line2) {
    fitFont(ctx, line2, f800, 104, 880);
    ctx.fillStyle = AMBER;
    ctx.fillText(line2, W / 2, 590);
  }
  ctx.restore();

  // Swoosh
  ctx.save();
  ctx.strokeStyle = AMBER;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(260, 622);
  ctx.quadraticCurveTo(512, 590, 750, 620);
  ctx.stroke();
  ctx.restore();

  // Date
  const dateText = formatCardDateRange(opts.rideDate, opts.endDate);
  ctx.font = `700 38px ${font}`;
  const dw = ctx.measureText(dateText).width;
  const dx = W / 2 - (dw + 70) / 2;
  iconCalendar(ctx, dx + 18, 682);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.fillText(dateText, dx + 70, 696);
  ctx.textAlign = "center";
  ctx.strokeStyle = "rgba(255,255,255,.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(dx - 150, 684);
  ctx.lineTo(dx - 20, 684);
  ctx.moveTo(dx + 70 + dw + 20, 684);
  ctx.lineTo(dx + 70 + dw + 150, 684);
  ctx.stroke();

  // Distance / duration
  const stat = (cx: number, drawIcon: (c: CanvasRenderingContext2D, x: number, y: number) => void, value: string) => {
    drawIcon(ctx, cx, 1068);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.5)";
    ctx.shadowBlur = 8;
    fitFont(ctx, value, (px) => `italic 800 ${px}px ${font}`, 52, 400);
    ctx.fillStyle = AMBER;
    ctx.fillText(value, cx, 1128);
    ctx.restore();
    ctx.fillStyle = "#fff";
    ctx.font = `600 24px ${font}`;
    ctx.fillText("(Approx)", cx, 1160);
  };
  if (opts.approxKm) stat(opts.approxHours ? 337 : 512, iconRoad, `~${opts.approxKm} km`);
  if (opts.approxHours) stat(opts.approxKm ? 703 : 512, iconClock, `~${opts.approxHours} hrs`);
  if (opts.approxKm && opts.approxHours) {
    ctx.strokeStyle = "rgba(255,255,255,.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(512, 1050);
    ctx.lineTo(512, 1165);
    ctx.stroke();
  }

  // Slots pill
  if (opts.slotsAvailable !== null) {
    ctx.strokeStyle = AMBER;
    ctx.fillStyle = "rgba(6,20,60,.75)";
    ctx.lineWidth = 3;
    roundRect(ctx, 222, 1188, 580, 78, 39);
    ctx.fill();
    ctx.stroke();
    iconPeople(ctx, 335, 1228);
    const n = opts.slotsAvailable;
    const num = n > 0 ? String(n) : "Ride";
    const rest = n > 0 ? (n === 1 ? " Slot Available" : " Slots Available") : " Full";
    ctx.textAlign = "left";
    ctx.font = `italic 800 46px ${font}`;
    const nw = ctx.measureText(num).width;
    ctx.fillStyle = AMBER;
    ctx.fillText(num, 400, 1243);
    ctx.font = `700 34px ${font}`;
    ctx.fillStyle = "#fff";
    ctx.fillText(rest, 400 + nw + 4, 1243);
    ctx.textAlign = "center";
  }

  // Cost banner
  if (opts.cost !== null) {
    ctx.fillStyle = AMBER;
    ctx.beginPath();
    ctx.moveTo(280, 1298);
    ctx.lineTo(778, 1298);
    ctx.lineTo(748, 1375);
    ctx.lineTo(250, 1375);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#101a33";
    fitFont(ctx, `Ride Cost: ₹${opts.cost.toLocaleString("en-IN")}`, (px) => `italic 800 ${px}px ${font}`, 48, 440);
    ctx.fillText(`Ride Cost: ₹${opts.cost.toLocaleString("en-IN")}`, 514, 1352);
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(150, 1335);
    ctx.lineTo(240, 1335);
    ctx.moveTo(790, 1335);
    ctx.lineTo(870, 1335);
    ctx.stroke();
  }

  // Footer
  ctx.fillStyle = "#fff";
  ctx.font = `700 26px ${font}`;
  ctx.fillText("theknightryders.com", W / 2, 1468);
  ctx.strokeStyle = "#f08a1c";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(250, 1460);
  ctx.lineTo(325, 1460);
  ctx.moveTo(699, 1460);
  ctx.lineTo(774, 1460);
  ctx.stroke();

  return canvas;
}

export async function getUpcomingRideCardDataUrl(opts: UpcomingRideCardOptions): Promise<string> {
  return (await buildCard(opts)).toDataURL("image/png");
}

export async function downloadUpcomingRideCard(opts: UpcomingRideCardOptions): Promise<void> {
  const canvas = await buildCard(opts);
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not generate image");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${opts.title.trim().replace(/[^a-zA-Z0-9]+/g, "_")}_upcoming_ride_the_knight_ryders.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
