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

export default function EliteRidesCarousel({ rides }: { rides: Ride[] }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(rides.length / PAGE_SIZE);
  const visible = rides.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 600,
              fontSize: 26,
              color: "#f5f5f5",
              letterSpacing: ".02em",
            }}
          >
            Rides
          </div>
          <div style={{ fontSize: 11.5, letterSpacing: ".1em", color: "#f0c24e", textTransform: "uppercase" }}>
            Expeditions &amp; Journeys
          </div>
        </div>
        {totalPages > 1 && (
          <div style={{ display: "flex", gap: 6, position: "absolute", right: 0 }}>
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
        <p style={{ color: "#8b929c", textAlign: "center" }}>No ride history linked yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
          }}
          className="elite-rides-grid"
        >
          {visible.map((ride) => (
            <a
              key={ride.id}
              href={`/rides/${ride.slug}`}
              style={{
                display: "block",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid rgba(240,194,78,.25)",
                background: "#0c0e12",
              }}
            >
              <div style={{ position: "relative", aspectRatio: "4/3", background: "#1a1d24" }}>
                {ride.hero_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ride.hero_image_url}
                    alt={ride.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
              </div>
              <div style={{ padding: "10px 12px" }}>
                <div style={{ color: "#f0f0f0", fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>
                  {ride.title}
                </div>
                {ride.ride_date && (
                  <div style={{ color: "#8b929c", fontSize: 11, marginTop: 3 }}>
                    {new Date(ride.ride_date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function navBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: 30,
    height: 30,
    borderRadius: "50%",
    border: "1px solid rgba(240,194,78,.5)",
    background: "transparent",
    color: disabled ? "#4a4f57" : "#f0c24e",
    fontSize: 16,
    cursor: disabled ? "default" : "pointer",
  };
}
