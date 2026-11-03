"use client";

import { useEffect, useState } from "react";
import { getUpcomingRideCardDataUrl, type UpcomingRideCardOptions } from "@/lib/upcomingRideCard";

/** The WhatsApp-style poster, used as the clickable card on the upcoming rides list. */
export default function UpcomingPosterCard({ href, ...opts }: UpcomingRideCardOptions & { href: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const { title, imageUrl, rideDate, endDate, approxKm, approxHours, slotsAvailable, cost } = opts;

  useEffect(() => {
    let cancelled = false;
    getUpcomingRideCardDataUrl({ title, imageUrl, rideDate, endDate, approxKm, approxHours, slotsAvailable, cost })
      .then((u) => !cancelled && setUrl(u))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [title, imageUrl, rideDate, endDate, approxKm, approxHours, slotsAvailable, cost]);

  return (
    <a href={href} style={{ display: "block", width: "100%", maxWidth: 320, transition: "transform .2s ease" }} className="upcoming-poster-link">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={`${title} upcoming ride`} style={{ width: "100%", display: "block", borderRadius: 14, boxShadow: "0 10px 30px rgba(3,12,73,.25)" }} />
      ) : (
        <div style={{ width: "100%", aspectRatio: "2/3", borderRadius: 14, background: "var(--mint)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--grey)", fontSize: 12 }}>
          Loading…
        </div>
      )}
    </a>
  );
}
