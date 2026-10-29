// Auto-extracts a handful of "highlight" lines out of a ride's free-text
// story, so the ride page can show a quick-scan summary above the full
// narrative without requiring admins to fill in any separate field.
//
// Heuristic, not magic: it scores each sentence of the story and keeps the
// best few, in their original order. A short or plain story (nothing scores)
// yields no highlights, and the caller simply skips rendering the section.

export type RideHighlight = {
  text: string;
  icon: string;
};

const KEYWORD_ICON: Array<{ pattern: RegExp; icon: string }> = [
  { pattern: /\bbreakfast\b/i, icon: "☕" },
  { pattern: /\blunch\b/i, icon: "🍽️" },
  { pattern: /\bdinner\b/i, icon: "🍽️" },
  { pattern: /\btea\b|\bchai\b|\bcoffee\b/i, icon: "☕" },
  { pattern: /\bview(point)?\b|\bsunrise\b|\bsunset\b/i, icon: "🌄" },
  { pattern: /\bwaterfall(s)?\b/i, icon: "💧" },
  { pattern: /\bhairpin(s)?\b|\bghat(s)?\b|\bbend(s)?\b|\bcurve(s)?\b/i, icon: "🏔️" },
  { pattern: /\btemple(s)?\b|\bfort(s)?\b/i, icon: "🛕" },
  { pattern: /\blake(s)?\b|\bdam(s)?\b|\bbackwater(s)?\b/i, icon: "🌊" },
  { pattern: /\bbeach(es)?\b/i, icon: "🏖️" },
  { pattern: /\brain\b|\bfog\b|\bmist\b|\bweather\b/i, icon: "🌧️" },
  { pattern: /\brepair|\bpuncture|\bbreakdown|\bflat tyre/i, icon: "🔧" },
  { pattern: /\bphoto(s)?\b|\bselfie(s)?\b/i, icon: "📸" },
  { pattern: /\bkm\b|\bkilometers?\b|\bkilometres?\b/i, icon: "🛣️" },
  { pattern: /\bstop(ped)?\b|\bbreak\b|\bpit stop\b/i, icon: "🛑" },
];

const DEFAULT_ICON = "⭐";

function iconFor(sentence: string): string {
  for (const { pattern, icon } of KEYWORD_ICON) {
    if (pattern.test(sentence)) return icon;
  }
  return DEFAULT_ICON;
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function score(sentence: string): number {
  if (sentence.length < 15 || sentence.length > 160) return 0;
  let s = 0;
  if (/\d/.test(sentence)) s += 2;
  for (const { pattern } of KEYWORD_ICON) {
    if (pattern.test(sentence)) {
      s += 1;
      break;
    }
  }
  // A handful of generic "something happened" verbs reads like a moment
  // worth calling out, even without a keyword match above.
  if (/\b(reached|crossed|started|flagged off|arrived|climbed|descended|rode|visited|explored|stopped)\b/i.test(sentence)) {
    s += 1;
  }
  return s;
}

/**
 * Extracts up to `max` highlight-worthy sentences from a ride's story text,
 * in original reading order. Returns [] when the text is too short/plain
 * for anything to score, so callers can skip the section entirely.
 */
export function extractHighlights(description: string | null, max = 4): RideHighlight[] {
  if (!description) return [];
  const sentences = splitSentences(description);
  if (sentences.length < 2) return [];

  const scored = sentences
    .map((text, index) => ({ text, index, score: score(text) }))
    .filter((s) => s.score > 0);

  if (scored.length < 2) return [];

  const top = scored
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, max)
    .sort((a, b) => a.index - b.index);

  return top.map(({ text }) => ({ text, icon: iconFor(text) }));
}
