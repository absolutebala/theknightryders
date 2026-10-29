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

export function parseRideDetails(description: string | null): RideDetail[] {
  if (!description) return [];

  const found = new Map<string, string[]>();
  for (const line of description.split(/\n+/)) {
    const m = line.match(LINE_PATTERN);
    if (!m) continue;
    const name = m[1].trim().toLowerCase();
    const alias = ALIASES.find((a) => a.names.includes(name));
    if (!alias) continue;
    const list = found.get(alias.key) ?? [];
    // Meal lines keep their own name so "Lunch: X" stays readable when merged.
    list.push(alias.key === "food" && name !== "food" && !name.startsWith("restaurant") ? `${m[1].trim()}: ${m[2]}` : m[2]);
    found.set(alias.key, list);
  }

  const details: RideDetail[] = [];
  for (const alias of ALIASES) {
    const values = found.get(alias.key);
    if (!values) continue;
    details.push({ key: alias.key, label: alias.label, icon: alias.icon, value: values.join(" · "), wide: alias.wide });
    if (alias.key === "reached") {
      const start = found.get("flagoff");
      const startMin = start ? parseTimeMinutes(start[0]) : null;
      const endMin = parseTimeMinutes(values[0]);
      if (startMin !== null && endMin !== null) {
        let diff = endMin - startMin;
        if (diff <= 0) diff += 24 * 60;
        details.push({ key: "duration", label: "Total Duration", icon: "⏱️", value: formatDuration(diff), wide: false });
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
