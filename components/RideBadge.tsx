"use client";

import { useId } from "react";
import { getRideBadgeTier } from "@/lib/rideBadges";

function TierGlyph({ level, color }: { level: number; color: string }) {
  switch (level) {
    case 1:
      return null;
    case 2:
      return <circle cx="0" cy="0" r="2.6" fill={color} />;
    case 3:
      return (
        <>
          <line x1="-4" y1="-4" x2="4" y2="4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          <line x1="4" y1="-4" x2="-4" y2="4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </>
      );
    case 4:
      return (
        <path
          d="M0 -6 L1.6 -1.8 L6 -1.8 L2.6 0.8 L4 5 L0 2.4 L-4 5 L-2.6 0.8 L-6 -1.8 L-1.6 -1.8 Z"
          fill={color}
        />
      );
    case 5:
      return (
        <path
          d="M-5 2 L-4 -4 L-1.6 -0.5 L0 -5 L1.6 -0.5 L4 -4 L5 2 L4 3.5 L-4 3.5 Z"
          fill={color}
        />
      );
    default:
      return null;
  }
}

export default function RideBadge({
  rideCount,
  size = 22,
}: {
  rideCount: number;
  size?: number;
}) {
  const gradId = useId();
  const tier = getRideBadgeTier(rideCount);
  if (!tier) return null;

  const { base, edge, shine } = tier.colors;

  return (
    <div
      title={`${tier.name} — ${rideCount} rides`}
      style={{
        position: "absolute",
        bottom: -size * 0.12,
        left: -size * 0.12,
        width: size,
        height: size,
        zIndex: 2,
      }}
    >
      <svg viewBox="-16 -16 32 32" width={size} height={size}>
        <defs>
          <radialGradient id={gradId} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={shine} />
            <stop offset="55%" stopColor={base} />
            <stop offset="100%" stopColor={edge} />
          </radialGradient>
        </defs>
        <circle cx="0" cy="0" r="14" fill={edge} />
        <circle cx="0" cy="0" r="12.5" fill={`url(#${gradId})`} stroke={edge} strokeWidth="0.75" />
        <ellipse cx="-4" cy="-6" rx="5" ry="2.6" fill="#ffffff" opacity="0.35" transform="rotate(-25 -4 -6)" />
        <TierGlyph level={tier.level} color="#ffffff" />
      </svg>
    </div>
  );
}
