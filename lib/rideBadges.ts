export type RideBadgeTier = {
  level: number;
  name: string;
  minRides: number;
  maxRides: number | null;
  colors: { base: string; edge: string; shine: string };
};

// Derives a lighter "shine" and darker "edge" shade from one base hex,
// so each tier only needs a single color defined by hand.
function shades(base: string): { base: string; edge: string; shine: string } {
  const hex = base.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const mix = (channel: number, target: number, amount: number) =>
    Math.round(channel + (target - channel) * amount);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  const shine = `#${toHex(mix(r, 255, 0.45))}${toHex(mix(g, 255, 0.45))}${toHex(mix(b, 255, 0.45))}`;
  const edge = `#${toHex(mix(r, 0, 0.4))}${toHex(mix(g, 0, 0.4))}${toHex(mix(b, 0, 0.4))}`;
  return { base, edge, shine };
}

const RAW_TIERS: { name: string; minRides: number; maxRides: number | null; base: string }[] = [
  { name: "Page", minRides: 1, maxRides: 4, base: "#8a8f98" },
  { name: "Squire", minRides: 5, maxRides: 9, base: "#cd7f32" },
  { name: "Knight", minRides: 10, maxRides: 19, base: "#b0b4bc" },
  { name: "Knight Bachelor", minRides: 20, maxRides: 24, base: "#e8b23d" },
  { name: "Knight Errant", minRides: 25, maxRides: 34, base: "#7fb069" },
  { name: "Knight Venturer", minRides: 35, maxRides: 49, base: "#3fa796" },
  { name: "Knight Commander", minRides: 50, maxRides: 59, base: "#4a90d9" },
  { name: "Knight Banneret", minRides: 60, maxRides: 74, base: "#6c5ce7" },
  { name: "Knight Marshal", minRides: 75, maxRides: 79, base: "#9b59b6" },
  { name: "Knight Champion", minRides: 80, maxRides: 89, base: "#c0392b" },
  { name: "Knight Paladin", minRides: 90, maxRides: 99, base: "#e91e8c" },
  { name: "Grand Knight", minRides: 100, maxRides: null, base: "#6b3fa0" },
];

export const RIDE_BADGE_TIERS: RideBadgeTier[] = RAW_TIERS.map((t, i) => ({
  level: i + 1,
  name: t.name,
  minRides: t.minRides,
  maxRides: t.maxRides,
  colors: shades(t.base),
}));

/** Returns the badge tier for a given ride count, or null if under 1 ride. */
export function getRideBadgeTier(rideCount: number): RideBadgeTier | null {
  if (rideCount < 1) return null;
  return RIDE_BADGE_TIERS.find((t) => rideCount >= t.minRides && (t.maxRides === null || rideCount <= t.maxRides)) ?? null;
}

/**
 * Returns the rides remaining and name of the next tier up, or null if
 * already at the top tier (Grand Knight).
 */
export function getNextTierProgress(rideCount: number): { ridesRemaining: number; nextTierName: string } | null {
  const currentIndex = RIDE_BADGE_TIERS.findIndex(
    (t) => rideCount >= t.minRides && (t.maxRides === null || rideCount <= t.maxRides)
  );
  const nextTier =
    currentIndex === -1
      ? RIDE_BADGE_TIERS[0] // below tier 1 (0 rides) -- next is Page
      : RIDE_BADGE_TIERS[currentIndex + 1];

  if (!nextTier) return null; // already Grand Knight

  return {
    ridesRemaining: nextTier.minRides - rideCount,
    nextTierName: nextTier.name,
  };
}
