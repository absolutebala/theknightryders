export type RideBadgeTier = {
  level: 1 | 2 | 3 | 4 | 5;
  name: string;
  minRides: number;
  maxRides: number | null;
  colors: { base: string; edge: string; shine: string };
};

export const RIDE_BADGE_TIERS: RideBadgeTier[] = [
  { level: 1, name: "Squire", minRides: 10, maxRides: 24, colors: { base: "#cd7f32", edge: "#8a5522", shine: "#e3a366" } },
  { level: 2, name: "Knight", minRides: 25, maxRides: 49, colors: { base: "#a8adb6", edge: "#6f7580", shine: "#d4d8dd" } },
  { level: 3, name: "Knight Errant", minRides: 50, maxRides: 74, colors: { base: "#f0c24e", edge: "#b8892a", shine: "#fbe08f" } },
  { level: 4, name: "Knight Commander", minRides: 75, maxRides: 99, colors: { base: "#7f9bb8", edge: "#4d6683", shine: "#c3d5e6" } },
  { level: 5, name: "Grand Knight", minRides: 100, maxRides: null, colors: { base: "#6b3fa0", edge: "#3f2461", shine: "#a878d6" } },
];

/** Returns the badge tier for a given ride count, or null if under 10 rides. */
export function getRideBadgeTier(rideCount: number): RideBadgeTier | null {
  if (rideCount < 10) return null;
  return RIDE_BADGE_TIERS.find((t) => rideCount >= t.minRides && (t.maxRides === null || rideCount <= t.maxRides)) ?? null;
}
