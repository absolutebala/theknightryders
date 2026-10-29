// Parses "Label: value" lines out of a ride's story so key trip facts
// (flag-off, reached, stay, food, route, challenges) can be shown as
// structured highlight cards. Only a colon counts as a separator, so the
// "Day 1 ... Breakfast - X" itinerary format is never mistaken for this.

export type RideDetailKey = "flagoff" | "reached" | "duration" | "stay" | "food" | "route" | "challenges";

export type RideDetail = {
  key: RideDetailKey;
  label: string;
  icon: string;
  value: string;
  wide: boolean;
};

const ALIASES: Array<{ key: Exclude<RideDetailKey, "duration">; label: string; icon: string; wide: boolean; names: string[] }> = [
  { key: "flagoff", label: "Flag Off", icon: "🏁", wide: false, names: ["flag off", "flagoff", "flag-off", "start", "started"] },
  { key: "reached", label: "Reached", icon: "📍", wide: false, names: ["reached", "arrived", "arrival", "reach"] },
  { key: "stay", label: "Stay", icon: "🏨", wide: true, names: ["stay", "hotel", "resort", "accommodation"] },
  { key: "food", label: "Food", icon: "🍽️", wide: true, names: ["restaurant", "restaurants", "food", "breakfast", "lunch", "dinner"] },
  { key: "route", label: "Route", icon: "🛣️", wide: true, names: ["route", "routes"] },
  { key: "challenges", label: "Challenges", icon: "⚠️", wide: true, names: ["challenge", "challenges"] },
];

const LINE_PATTERN = /^\s*([A-Za-z][A-Za-z \-]{1,24}?)\s*:\s*(.+?)\s*$/;

function parseTimeMinutes(value: string): number | null {
  const m = value.match(/(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?/i);
  if (!m) return null;
  const hasMinutes = m[2] !== undefined;
  const meridiem = m[3]?.toLowerCase();
  if (!hasMinutes && !meridiem) return null;
  let h = parseInt(m[1], 10);
  const min = hasMinutes ? parseInt(m[2], 10) : 0;
  if (h > 23 || min > 59) return null;
  if (meridiem === "pm" && h < 12) h += 12;
  if (meridiem === "am" && h === 12) h = 0;
  return h * 60 + min;
}

function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const TIME = /\b\d{1,2}(?:[:.]\d{2})?\s*[ap]\.?m\.?(?![a-z])|\b\d{1,2}[:.]\d{2}\b/i;
const CAP = "[A-Z][\\w'&-]*(?:\\s+[A-Z][\\w'&-]*){0,3}";
const LODGING = "(?:Hotel|Resort|Lodge|Homestay|Residency|Inn|Villa|Cottage|Estate|Camp|Palace|Stay)";
const EATERY = "(?:Restaurant|Mess|Dhaba|Bhavan|Canteen|Caf\u00e9|Cafe|Bakery|Kitchen|Biryani|Hotel)";

function splitSentences(text: string): string[] {
  return text.replace(/[ \t]+/g, " ").split(/(?<=[.!?])\s+|\n+/).map((x) => x.trim()).filter(Boolean);
}

function cleanTime(raw: string): string {
  return raw.replace(/\.$/, "").replace(/([ap])\.m\.?/i, "$1m").replace(/\s+/g, " ").toUpperCase().replace(/(\d)(AM|PM)/, "$1 $2");
}

function placeAfter(sentence: string, words: string): string | null {
  const m = sentence.match(new RegExp("\\b(?:" + words + ")\\s+(" + CAP + ")"));
  return m ? m[1].trim() : null;
}

function timeAndPlace(sentence: string, placeWords: string): string | null {
  const t = sentence.match(TIME);
  const place = placeAfter(sentence, placeWords);
  if (!t && !place) return null;
  return [t ? cleanTime(t[0]) : null, place].filter(Boolean).join(", ");
}

function extractFromProse(text: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  const add = (k: string, v: string) => {
    const list = out.get(k) ?? [];
    if (!list.includes(v)) list.push(v);
    out.set(k, list);
  };
  const sentences = splitSentences(text);

  for (const s of sentences) {
    if (!out.has("flagoff") && /\b(flag(?:ged)?[ -]?off|set off|kick(?:ed)? off|started|departed|left|began)\b/i.test(s) && TIME.test(s)) {
      const v = timeAndPlace(s, "from|at|near");
      if (v) add("flagoff", v);
    }
    if (!out.has("reached") && /\b(reached|arrived|reaching|made it to|wrapped up|returned|got back|checked[- ]in)\b/i.test(s) && TIME.test(s)) {
      const v = timeAndPlace(s, "reached|arrived at|arrived in|reaching|made it to|returned to|back (?:in|at|to)");
      if (v) add("reached", v);
    }
    if (!out.has("stay")) {
      const lodge = s.match(new RegExp("\\b((?:[A-Z][\\w&']+\\s+){0,3}" + LODGING + "(?:\\s+[A-Z][\\w&']+){0,2})"));
      const stayAt = s.match(new RegExp("\\b(?:[Ss]tay(?:ed)?|[Ss]tayed|night stay|[Cc]hecked[- ]in)\\s+(?:at|in|@)\\s+(" + CAP + ")"));
      const v = lodge?.[1] ?? stayAt?.[1];
      if (v) add("stay", v.trim());
    }
    const meals = [...s.matchAll(new RegExp("\\b([Bb]reakfast|[Ll]unch|[Dd]inner|[Tt]ea|[Ss]nacks|[Cc]offee)\\s+(?:was\\s+)?(?:at|in|from|@)\\s+(" + CAP + ")", "g"))];
    if (meals.length > 0) {
      for (const meal of meals) {
        const name = meal[1][0].toUpperCase() + meal[1].slice(1).toLowerCase();
        add("food", `${name}: ${meal[2].trim()}`);
      }
    } else {
      const eat = s.match(new RegExp("\\b((?:[A-Z][\\w&']+\\s+){0,3}" + EATERY + "(?:\\s+[A-Z][\\w&']+){0,2})"));
      if (eat && !/\b(Hotel|Resort)\b/.test(eat[1])) add("food", eat[1].trim());
    }
    if (!out.has("route") && /\b(via|through|route|highway|NH ?\d+|SH ?\d+|ghat|bypass|hairpin|took the|expressway)\b/i.test(s)) {
      add("route", s.length > 170 ? s.slice(0, 167).trimEnd() + "..." : s);
    }
    if ((out.get("challenges")?.length ?? 0) < 2 && /\b(rain|fog|mist|traffic|jam|puncture|breakdown|broke down|landslide|pothole|slippery|steep|tough|challeng\w*|difficult|delay\w*|struggle\w*|diversion|road ?block|closed|chilly|scorching)\b/i.test(s)) {
      add("challenges", s.length > 170 ? s.slice(0, 167).trimEnd() + "..." : s);
    }
  }
  return out;
}

export function parseRideDetails(description: string | null): RideDetail[] {
  if (!description) return [];

  // 1) Explicit "Label: value" lines win.
  const found = new Map<string, string[]>();
  for (const line of description.split(/\n+/)) {
    const m = line.match(LINE_PATTERN);
    if (!m) continue;
    const name = m[1].trim().toLowerCase();
    const alias = ALIASES.find((a) => a.names.includes(name));
    if (!alias) continue;
    const list = found.get(alias.key) ?? [];
    list.push(alias.key === "food" && name !== "food" && !name.startsWith("restaurant") ? `${m[1].trim()}: ${m[2]}` : m[2]);
    found.set(alias.key, list);
  }

  // 2) Anything still missing is pulled from the ordinary prose.
  const prose = extractFromProse(description);
  for (const [k, v] of prose) if (!found.has(k)) found.set(k, v);

  const details: RideDetail[] = [];
  for (const alias of ALIASES) {
    const values = found.get(alias.key);
    if (!values) continue;
    details.push({ key: alias.key, label: alias.label, icon: alias.icon, value: values.join(" \u00b7 "), wide: alias.wide });
    if (alias.key === "reached") {
      const start = found.get("flagoff");
      const startMin = start ? parseTimeMinutes(start[0]) : null;
      const endMin = parseTimeMinutes(values[0]);
      if (startMin !== null && endMin !== null) {
        let diff = endMin - startMin;
        if (diff <= 0) diff += 24 * 60;
        details.push({ key: "duration", label: "Total Duration", icon: "\u23f1\ufe0f", value: formatDuration(diff), wide: false });
      }
    }
  }
  return details;
}

// Heading labels styled bold + coloured inside the story text itself.
export function isStoryHeading(label: string): boolean {
  const name = label.trim().toLowerCase();
  return ALIASES.some((a) => a.names.includes(name)) || ["highlights", "summary", "day", "notes"].includes(name);
}

// ---------------------------------------------------------------------------
// Multi-day rides: "Day 1 — Chennai to Valparai: subtitle" sections each get
// their own card (flag off, reached, duration, stay, food, highlights,
// challenges) so times from different days are never mixed together.
// ---------------------------------------------------------------------------

export type RideDay = {
  label: string; // "Day 1"
  route: string; // "Chennai to Valparai"
  rows: Array<{ label: string; icon: string; value: string }>;
};

const DAY_HEADING = /^\s*Day\s*(\d+)\s*[—–\-:]\s*(.+?)\s*$/i;
const START_RE = /\b(flag(?:ged)?[ -]?off|set off|kick(?:ed)? off|started|departed|left|began|rolled out|rolling out)\b/i;
const REACH_RE = /\b(reached|arrived|reaching|made it|wrapped up|returned|returning|got back)\b/i;
const HIGHLIGHT_GROUPS = [
  /\b(elephants?|wildlife|leopard|deer|bison|tiger)\b/i,
  /\bwaterfalls?\b/i,
  /\b(sunrise|sunset|viewpoint)\b/i,
];
const CHALLENGE_RE = /\b(rain|fog|mist|traffic|jam|puncture|breakdown|broke down|landslide|pothole|slippery|steep|tough|difficult|delay\w*|struggle\w*|diversion|road ?block|deadline|skip(?:ped)? lunch|soaked|wet)\b/i;

function clip(s: string): string {
  return s.length > 170 ? s.slice(0, 167).trimEnd() + "..." : s;
}

function firstTime(s: string): string | null {
  const m = s.match(TIME);
  return m ? cleanTime(m[0]) : null;
}

export function parseRideDays(description: string | null): RideDay[] | null {
  if (!description) return null;
  const lines = description.split("\n");
  const headingIdx: number[] = [];
  lines.forEach((l, i) => {
    if (DAY_HEADING.test(l)) headingIdx.push(i);
  });
  if (headingIdx.length < 2) return null;

  const intro = splitSentences(lines.slice(0, headingIdx[0]).join("\n"));
  const days: RideDay[] = [];

  headingIdx.forEach((start, n) => {
    const end = n + 1 < headingIdx.length ? headingIdx[n + 1] : lines.length;
    const h = lines[start].match(DAY_HEADING)!;
    const route = h[2].split(":")[0].trim();
    const [fromRaw, toRaw] = route.split(/\s+to\s+/i);
    const from = toRaw ? fromRaw.trim() : null;
    const to = toRaw ? toRaw.trim() : null;

    // Stop at the first standalone short heading (e.g. "What a Ride It Was!")
    // so a closing summary never leaks into the last day.
    let stop = end;
    for (let i = start + 2; i < end; i++) {
      const t = lines[i].trim();
      if (t && t.length <= 60 && !/[.,]$/.test(t) && !/\.\s/.test(t) && !lines[i - 1].trim() && !lines[i + 1]?.trim()) {
        stop = i;
        break;
      }
    }
    const sentences = splitSentences(lines.slice(start + 1, stop).join("\n"));
    const pool = n === 0 ? [...sentences, ...intro] : sentences;

    const startSentence = pool.find((s) => START_RE.test(s) && TIME.test(s));
    const startTime = startSentence ? firstTime(startSentence) : null;
    const startPlace = startSentence ? placeAfter(startSentence, "from|of|at|near") ?? from : from;

    const reachSentence = sentences.find((s) => s !== startSentence && REACH_RE.test(s) && TIME.test(s));
    const reachTime = reachSentence ? firstTime(reachSentence) : null;
    const reachPlace = reachSentence
      ? placeAfter(reachSentence, "reached|arrived at|arrived in|reaching|made it to|returned to|returning to|back (?:in|at|to)") ?? to
      : to;

    const rows: RideDay["rows"] = [];
    if (startTime) rows.push({ label: "Flag Off", icon: "\u{1F3C1}", value: [startTime, startPlace].filter(Boolean).join(", ") });
    if (reachTime) rows.push({ label: "Reached", icon: "\u{1F4CD}", value: [reachTime, reachPlace].filter(Boolean).join(", ") });
    const sMin = startTime ? parseTimeMinutes(startTime) : null;
    const eMin = reachTime ? parseTimeMinutes(reachTime) : null;
    if (sMin !== null && eMin !== null) {
      let diff = eMin - sMin;
      if (diff <= 0) diff += 24 * 60;
      rows.push({ label: "Duration", icon: "⏱️", value: formatDuration(diff) });
    }

    const prose = extractFromProse(sentences.join("\n"));
    const stay = prose.get("stay")?.[0];
    if (stay) rows.push({ label: "Stay", icon: "\u{1F3E8}", value: stay });
    const food = prose.get("food");
    if (food) rows.push({ label: "Food", icon: "\u{1F37D}️", value: food.join(" · ") });

    const picked = HIGHLIGHT_GROUPS.map((re) => sentences.findIndex((s) => re.test(s))).filter((i) => i >= 0);
    const highlights = [...new Set(picked)].sort((a, b) => a - b).map((i) => clip(sentences[i]));
    if (highlights.length) rows.push({ label: "Highlights", icon: "✨", value: highlights.join(" ") });

    const challenges = sentences
      .filter((s) => CHALLENGE_RE.test(s) && !/\b(thankfully|given us a break|gave us a break)\b/i.test(s))
      .slice(0, 2)
      .map(clip);
    if (challenges.length) rows.push({ label: "Challenges", icon: "⚠️", value: challenges.join(" ") });

    days.push({ label: `Day ${h[1]}`, route, rows });
  });

  return days;
}
