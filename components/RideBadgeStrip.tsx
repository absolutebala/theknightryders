import { getRideBadgeTier, getNextTierProgress } from "@/lib/rideBadges";

function TierCrownIcon({ base, edge, shine, size }: { base: string; edge: string; shine: string; size: number }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 24 20" style={{ verticalAlign: "middle", marginRight: 8, flexShrink: 0 }}>
      <path
        d="M2 18 L2 9 L6.5 13 L9.5 5 L12 13 L14.5 5 L17.5 13 L22 9 L22 18 Z"
        fill={base}
        stroke={edge}
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
      <rect x="2" y="16.5" width="20" height="2.5" rx="0.5" fill={base} stroke={edge} strokeWidth="0.75" />
      <circle cx="6.5" cy="12.5" r="1.3" fill={shine} />
      <circle cx="12" cy="12" r="1.3" fill={shine} />
      <circle cx="17.5" cy="12.5" r="1.3" fill={shine} />
    </svg>
  );
}

export default function RideBadgeStrip({
  rideCount,
  variant = "rider-card",
}: {
  rideCount: number;
  variant?: "rider-card" | "profile-card" | "elite" | "standalone";
}) {
  const tier = getRideBadgeTier(rideCount);
  if (!tier) return null;

  const progress = getNextTierProgress(rideCount);
  const isDark = variant === "elite";
  const textColor = isDark ? tier.colors.shine : tier.colors.edge;

  return (
    <div className={`ride-badge-strip ride-badge-strip-${variant}`}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <TierCrownIcon {...tier.colors} size={26} />
        <span style={{ color: textColor }}>{tier.name}</span>
      </div>
      {progress && (
        <div className="ride-badge-strip-progress">
          {progress.ridesRemaining} more ride{progress.ridesRemaining === 1 ? "" : "s"} to be {progress.nextTierName}
        </div>
      )}
    </div>
  );
}
