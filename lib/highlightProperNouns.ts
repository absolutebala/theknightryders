// Splits free text into plain and bold segments, bolding the names of
// people and places. Mid-sentence capitalised words are treated as proper
// nouns, sentence-opening words only when they're part of a longer name or
// a name we already know (member / co-rider names passed in).

export type TextSegment = { text: string; bold: boolean };

const STOP = new Set(
  [
    "I", "The", "A", "An", "My", "We", "Our", "It", "In", "On", "At", "From", "With", "Since", "Every",
    "This", "That", "And", "But", "After", "Before", "During", "As", "One", "Each", "His", "Her", "Their",
    "Its", "To", "Of", "For", "By", "If", "So", "When", "While", "Over", "Through", "Along", "Having",
    "Today", "Together", "Riding", "Rides", "Highlights", "Then", "Thanks", "Thankfully", "Still", "What",
    "Some", "Three", "Two", "Four", "Five", "Day", "Days",
  ].map((w) => w.toLowerCase())
);

const NOT_NAMES = new Set(
  [
    "january", "february", "march", "april", "may", "june", "july", "august", "september", "october",
    "november", "december", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "i",
  ]
);

const PHRASE = /[A-Z][A-Za-z]*(?:['’][a-z]+)?(?:\s+[A-Z][A-Za-z]*(?:['’][a-z]+)?)*/g;

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function highlightProperNouns(text: string, knownNames: string[] = []): TextSegment[] {
  const ranges: Array<[number, number]> = [];
  const known = new Set(knownNames.map((n) => n.trim().toLowerCase()).filter(Boolean));

  for (const m of text.matchAll(PHRASE)) {
    const start = m.index ?? 0;
    const before = text.slice(0, start);
    const atSentenceStart = start === 0 || /[.!?]\s+$/.test(before) || /\n\s*$/.test(before);

    const words = [...m[0].matchAll(/\S+/g)].map((w) => ({ word: w[0], offset: w.index ?? 0 }));
    let first = 0;
    let droppedStop = false;
    while (first < words.length && (STOP.has(words[first].word.toLowerCase()) || (!atSentenceStart && first === 0 && false))) {
      first++;
      droppedStop = true;
    }
    const kept = words.slice(first).filter((w) => !NOT_NAMES.has(w.word.toLowerCase().replace(/['’]s$/, "")));
    if (kept.length === 0) continue;

    // A lone opening word of a sentence is usually just a capitalised
    // ordinary word ("Riding", "Every"), so only trust it if it's a known name.
    const lone = kept.length === 1;
    const isKnown = known.has(kept.map((w) => w.word.replace(/['’]s$/, "")).join(" ").toLowerCase());
    if (atSentenceStart && !droppedStop && lone && !isKnown) continue;

    const s = start + kept[0].offset;
    const last = kept[kept.length - 1];
    ranges.push([s, start + last.offset + last.word.length]);
  }

  // Known names are bolded wherever they appear, even in lower case.
  for (const name of known) {
    if (name.length < 2) continue;
    for (const m of text.matchAll(new RegExp(`\\b${escapeRegExp(name)}\\b`, "gi"))) {
      const s = m.index ?? 0;
      ranges.push([s, s + m[0].length]);
    }
  }

  ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const merged: Array<[number, number]> = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }

  const out: TextSegment[] = [];
  let pos = 0;
  for (const [s, e] of merged) {
    if (s > pos) out.push({ text: text.slice(pos, s), bold: false });
    out.push({ text: text.slice(s, e), bold: true });
    pos = e;
  }
  if (pos < text.length) out.push({ text: text.slice(pos), bold: false });
  return out;
}
