import { getRideBadgeTier } from "@/lib/rideBadges";

const TIER_GLYPHS: Record<number, string> = {
  1: "\u2694", // Squire - plain
  2: "\u2694", // Knight
  3: "\u2694\ufe0f", // Knight Errant
  4: "\u2b50", // Commander
  5: "\ud83d\udc51", // Grand Knight
};

export default function RideBadgeStrip({ rideCount }: { rideCount: number }) {
  const tier = getRideBadgeTier(rideCount);
  if (!tier) return null;

  return (
    <div
      className="ride-badge-strip"
      style={{
        background: `linear-gradient(135deg, ${tier.colors.shine}, ${tier.colors.base} 55%, ${tier.colors.edge})`,
      }}
    >
      <span style={{ marginRight: 6 }}>{TIER_GLYPHS[tier.level]}</span>
      {tier.name}
    </div>
  );
}
