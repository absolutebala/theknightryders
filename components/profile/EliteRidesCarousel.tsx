"use client";

import { useRef, useState } from "react";

type Ride = {
  id: string;
  slug: string;
  title: string;
  ride_date: string | null;
  hero_image_url: string | null;
  ride_number: number | null;
};

const PAGE_SIZE = 15;

export default function EliteRidesCarousel({ rides }: { rides: Ride[] }) {
  const [page, setPage] = useState(0);
  const titleRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.ceil(rides.length / PAGE_SIZE);
  const visible = rides.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  function goToPage(next: number) {
    setPage(next);
    titleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <div className="elite-section-header" ref={titleRef}>
        <h2>My Rides</h2>
        <p>Expeditions &amp; Journeys</p>
      </div>

      {rides.length === 0 ? (
        <p style={{ color: "#64748b" }}>No ride history linked yet.</p>
      ) : (
        <>
          <div className="elite-rides-grid-v2">
            {visible.map((ride) => {
              const rideNumber = ride.ride_number ? `#${ride.ride_number}` : null;
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

          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 24 }}>
              <button
                type="button"
                aria-label="Previous rides"
                onClick={() => goToPage(Math.max(0, page - 1))}
                disabled={page === 0}
                style={navBtnStyle(page === 0)}
              >
                &#8249;
              </button>
              <span style={{ color: "#94a3b8", fontSize: 12.5 }}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                type="button"
                aria-label="Next rides"
                onClick={() => goToPage(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
                style={navBtnStyle(page === totalPages - 1)}
              >
                &#8250;
              </button>
            </div>
          )}
        </>
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
