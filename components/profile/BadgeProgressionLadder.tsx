import { RIDE_BADGE_TIERS, getRideBadgeTier, getNextTierProgress } from "@/lib/rideBadges";

export default function BadgeProgressionLadder({ rideCount }: { rideCount: number }) {
  const currentTier = getRideBadgeTier(rideCount);
  const progress = getNextTierProgress(rideCount);

  return (
    <div style={{ marginBottom: 40 }}>
      <div className="elite-subsection-title">Badge / Career Progression</div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          overflowX: "auto",
          maxWidth: "100%",
          gap: 0,
          padding: "20px 4px",
        }}
      >
        {RIDE_BADGE_TIERS.map((tier, i) => {
          const isCurrent = currentTier?.level === tier.level;
          const isPast = currentTier ? tier.level < currentTier.level : false;
          const isFuture = currentTier ? tier.level > currentTier.level : true;

          return (
            <div key={tier.level} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 74 }}>
                <div
                  style={{
                    width: isCurrent ? 46 : 34,
                    height: isCurrent ? 46 : 34,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isPast || isCurrent
                      ? `radial-gradient(circle at 35% 30%, ${tier.colors.shine}, ${tier.colors.base} 55%, ${tier.colors.edge})`
                      : "rgba(255,255,255,.06)",
                    border: isCurrent ? `2px solid ${tier.colors.shine}` : "1px solid rgba(255,255,255,.15)",
                    boxShadow: isCurrent ? `0 0 16px ${tier.colors.base}` : "none",
                    transition: "all .2s ease",
                  }}
                >
                  <svg width={isCurrent ? 20 : 15} height={isCurrent ? 20 : 15} viewBox="0 0 24 24" fill="none">
                    <path
                      d="M2 18 L2 9 L6.5 13 L9.5 5 L12 13 L14.5 5 L17.5 13 L22 9 L22 18 Z"
                      fill={isPast || isCurrent ? "#fff" : "rgba(255,255,255,.3)"}
                    />
                    <rect x="2" y="16.5" width="20" height="2.5" rx="0.5" fill={isPast || isCurrent ? "#fff" : "rgba(255,255,255,.3)"} />
                  </svg>
                </div>
                <div
                  style={{
                    fontSize: 9.5,
                    marginTop: 8,
                    textAlign: "center",
                    color: isCurrent ? tier.colors.shine : isPast ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.3)",
                    fontWeight: isCurrent ? 800 : 500,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {tier.name}
                </div>
              </div>
              {i < RIDE_BADGE_TIERS.length - 1 && (
                <div
                  style={{
                    width: 20,
                    height: 2,
                    flexShrink: 0,
                    marginBottom: 20,
                    background: isPast ? "rgba(212,175,55,.5)" : "rgba(255,255,255,.12)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      {progress && (
        <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,.55)", marginTop: 4 }}>
          {progress.ridesRemaining} more ride{progress.ridesRemaining === 1 ? "" : "s"} to {progress.nextTierName}
        </div>
      )}
    </div>
  );
}
