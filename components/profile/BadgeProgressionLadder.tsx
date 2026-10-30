"use client";

import { useEffect, useRef, useState } from "react";
import { RIDE_BADGE_TIERS, getRideBadgeTier, getNextTierProgress } from "@/lib/rideBadges";

const ITEM_MIN_WIDTH = 84; // px each badge + label needs to stay readable
const MAX_PER_SIDE = 3;

// Shows the member's current badge in the centre with a few previous and
// upcoming badges either side. How many fit depends on the width available
// (full row when there is no photo album, half a row when there is), so the
// ladder never overflows or gets clipped.
export default function BadgeProgressionLadder({ rideCount }: { rideCount: number }) {
  const currentTier = getRideBadgeTier(rideCount);
  const progress = getNextTierProgress(rideCount);
  const containerRef = useRef<HTMLDivElement>(null);
  const [perSide, setPerSide] = useState(2);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const fit = Math.floor((el.clientWidth / ITEM_MIN_WIDTH - 1) / 2);
      setPerSide(Math.max(1, Math.min(MAX_PER_SIDE, fit)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const total = RIDE_BADGE_TIERS.length;
  const windowSize = Math.min(total, perSide * 2 + 1);
  const currentIndex = currentTier ? RIDE_BADGE_TIERS.findIndex((t) => t.level === currentTier.level) : -1;
  // Centre on the current badge; near either end the window slides so it
  // stays full instead of leaving blank space.
  const centre = currentIndex >= 0 ? currentIndex : 0;
  const start = Math.max(0, Math.min(total - windowSize, centre - perSide));
  const visible = RIDE_BADGE_TIERS.slice(start, start + windowSize);

  return (
    <div style={{ marginBottom: 40 }}>
      <div className="elite-subsection-title">Badge / Career Progression</div>
      <div ref={containerRef} style={{ width: "100%", padding: "20px 0 4px" }}>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          {visible.map((tier, i) => {
            const isCurrent = currentTier?.level === tier.level;
            const isPast = currentTier ? tier.level < currentTier.level : false;
            const earned = isPast || isCurrent;
            const distance = currentIndex >= 0 ? Math.abs(RIDE_BADGE_TIERS.indexOf(tier) - currentIndex) : i;
            const fade = isCurrent ? 1 : Math.max(0.55, 1 - distance * 0.14);
            const leftLit = currentTier ? tier.level <= currentTier.level : false;
            const rightLit = currentTier ? tier.level < currentTier.level : false;
            const size = isCurrent ? 54 : 38;

            return (
              <div
                key={tier.level}
                style={{
                  flex: "1 1 0",
                  minWidth: 0,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  opacity: fade,
                }}
              >
                {/* connector lines, centred on the badge row */}
                {i > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 27,
                      left: 0,
                      width: `calc(50% - ${size / 2 + 2}px)`,
                      height: 2,
                      background: leftLit ? "rgba(212,175,55,.55)" : "rgba(255,255,255,.14)",
                    }}
                  />
                )}
                {i < visible.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 27,
                      right: 0,
                      width: `calc(50% - ${size / 2 + 2}px)`,
                      height: 2,
                      background: rightLit ? "rgba(212,175,55,.55)" : "rgba(255,255,255,.14)",
                    }}
                  />
                )}

                <div style={{ height: 54, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div
                    style={{
                      width: size,
                      height: size,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: earned
                        ? `radial-gradient(circle at 35% 30%, ${tier.colors.shine}, ${tier.colors.base} 55%, ${tier.colors.edge})`
                        : "rgba(255,255,255,.06)",
                      border: isCurrent ? `2px solid ${tier.colors.shine}` : "1px solid rgba(255,255,255,.15)",
                      boxShadow: isCurrent ? `0 0 22px ${tier.colors.base}` : "none",
                    }}
                  >
                    <svg width={isCurrent ? 24 : 17} height={isCurrent ? 24 : 17} viewBox="0 0 24 24" fill="none">
                      <path
                        d="M2 18 L2 9 L6.5 13 L9.5 5 L12 13 L14.5 5 L17.5 13 L22 9 L22 18 Z"
                        fill={earned ? "#fff" : "rgba(255,255,255,.3)"}
                      />
                      <rect x="2" y="16.5" width="20" height="2.5" rx="0.5" fill={earned ? "#fff" : "rgba(255,255,255,.3)"} />
                    </svg>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: isCurrent ? 12 : 10.5,
                    marginTop: 8,
                    padding: "0 2px",
                    textAlign: "center",
                    color: isCurrent ? tier.colors.shine : earned ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.4)",
                    fontWeight: isCurrent ? 800 : 500,
                    lineHeight: 1.25,
                    overflowWrap: "anywhere",
                  }}
                >
                  {tier.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {progress && (
        <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,.55)", marginTop: 10 }}>
          {progress.ridesRemaining} more ride{progress.ridesRemaining === 1 ? "" : "s"} to {progress.nextTierName}
        </div>
      )}
    </div>
  );
}
