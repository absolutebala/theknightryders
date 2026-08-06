"use client";

import { useId } from "react";
import { getRideBadgeTier } from "@/lib/rideBadges";

function TierGlyph({ color }: { color: string }) {
  return (
    <g transform="translate(-6,-4) scale(0.5)">
      <path
        d="M2 18 L2 9 L6.5 13 L9.5 5 L12 13 L14.5 5 L17.5 13 L22 9 L22 18 Z"
        fill={color}
      />
      <rect x="2" y="16.5" width="20" height="2.5" rx="0.5" fill={color} />
    </g>
  );
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
        <TierGlyph color="#ffffff" />
      </svg>
    </div>
  );
}
