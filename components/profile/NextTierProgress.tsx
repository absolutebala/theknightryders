import { getRideBadgeTier, getNextTierProgress } from "@/lib/rideBadges";

export default function NextTierProgress({ rideCount }: { rideCount: number }) {
  const progress = getNextTierProgress(rideCount);
  if (!progress) {
    return (
      <div>
        <div className="elite-subsection-title">What&apos;s Next</div>
        <div
          style={{
            background: "linear-gradient(135deg, rgba(212,175,55,.15), rgba(212,175,55,.05))",
            border: "1px solid rgba(212,175,55,.3)",
            borderRadius: 14,
            padding: "18px 22px",
            color: "#d4af37",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Grand Knight -- the highest tier in the club. There&apos;s nowhere higher to climb.
        </div>
      </div>
    );
  }

  const currentTier = getRideBadgeTier(rideCount);
  const tierStart = currentTier?.minRides ?? 0;
  const nextTierMin = tierStart + (currentTier?.maxRides ? currentTier.maxRides - tierStart + 1 : progress.ridesRemaining + (rideCount - tierStart));
  const span = Math.max(1, nextTierMin - tierStart);
  const pct = Math.min(100, Math.max(4, Math.round(((rideCount - tierStart) / span) * 100)));

  return (
    <div>
      <div className="elite-subsection-title">What&apos;s Next</div>
      <div
        style={{
          background: "linear-gradient(135deg, rgba(212,175,55,.15), rgba(108,63,160,.1))",
          border: "1px solid rgba(212,175,55,.3)",
          borderRadius: 14,
          padding: "18px 22px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ color: "#f0f0f0", fontWeight: 800, fontSize: 15 }}>{progress.nextTierName}</span>
          <span style={{ color: "#d4af37", fontSize: 12.5, fontWeight: 700 }}>
            {progress.ridesRemaining} ride{progress.ridesRemaining === 1 ? "" : "s"} to go
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 5, background: "rgba(255,255,255,.1)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: 5,
              background: "linear-gradient(90deg, #6c3fa0, #d4af37)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
