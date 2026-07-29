"use client";

import { useState } from "react";

type Ride = {
  id: string;
  slug: string;
  title: string;
  ride_date: string | null;
  hero_image_url: string | null;
};

const PAGE_SIZE = 6;

function parseRideNumber(title: string): string | null {
  const match = title.match(/ride\s*#\s*(\d+)/i);
  return match ? `#${match[1]}` : null;
}

export default function EliteRidesCarousel({ rides }: { rides: Ride[] }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(rides.length / PAGE_SIZE);
  const visible = rides.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      <div className="elite-section-header" style={{ position: "relative" }}>
        <h2>Rides</h2>
        <p>Expeditions &amp; Journeys</p>
        {totalPages > 1 && (
          <div style={{ position: "absolute", top: 4, right: 0, display: "flex", gap: 6 }}>
            <button
              type="button"
              aria-label="Previous rides"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={navBtnStyle(page === 0)}
            >
              &#8249;
            </button>
            <button
              type="button"
              aria-label="Next rides"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              style={navBtnStyle(page === totalPages - 1)}
            >
              &#8250;
            </button>
          </div>
        )}
      </div>

      {rides.length === 0 ? (
        <p style={{ color: "#64748b" }}>No ride history linked yet.</p>
      ) : (
        <div className="elite-rides-grid-v2">
          {visible.map((ride) => {
            const rideNumber = parseRideNumber(ride.title);
            return (
              <a key={ride.id} href={`/rides/${ride.slug}`} className="elite-ride-card-v2">
                <div className="elite-ride-thumb">
                  {ride.hero_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ride.hero_image_url} alt={ride.title} />
                  )}
                  {rideNumber && <div className="elite-ride-badge-hex">{rideNumber}</div>}
                </div>
                <div className="elite-ride-info">
                  <h3>{ride.title}</h3>
                  {ride.ride_date && (
                    <span>
                      {new Date(ride.ride_date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

function navBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: 26,
    height: 26,
    borderRadius: "50%",
    border: `1px solid ${disabled ? "rgba(255,255,255,.15)" : "rgba(212,175,55,.5)"}`,
    background: "transparent",
    color: disabled ? "#4a4f57" : "#d4af37",
    fontSize: 14,
    cursor: disabled ? "default" : "pointer",
  };
}
