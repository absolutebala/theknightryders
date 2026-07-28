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
const GOLD = "#d4af37";

function parseRideNumber(title: string): string | null {
  const match = title.match(/ride\s*#\s*(\d+)/i);
  return match ? `RIDE #${match[1]}` : null;
}

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
          marginBottom: 22,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: "2px",
              color: "#fff",
              textTransform: "uppercase",
            }}
          >
            Rides
          </div>
          <div style={{ fontSize: 11.5, letterSpacing: "3px", color: "#718096", textTransform: "uppercase", marginTop: 2 }}>
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
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}
          className="elite-rides-grid"
        >
          {visible.map((ride) => {
            const rideNumber = parseRideNumber(ride.title);
            return (
              <a key={ride.id} href={`/rides/${ride.slug}`} className="elite-ride-card">
                <div style={{ position: "relative", aspectRatio: "4/3", background: "#1a1d24", overflow: "hidden" }}>
                  {ride.hero_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ride.hero_image_url}
                      alt={ride.title}
                      className="elite-ride-img"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                  {rideNumber && (
                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        background: "rgba(0,0,0,.8)",
                        border: `1px solid ${GOLD}`,
                        color: GOLD,
                        fontSize: 9.5,
                        fontWeight: 700,
                        padding: "3px 7px",
                        borderRadius: 4,
                        letterSpacing: ".03em",
                      }}
                    >
                      {rideNumber}
                    </div>
                  )}
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <div
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: ".01em",
                      lineHeight: 1.3,
                    }}
                  >
                    {ride.title}
                  </div>
                  {ride.ride_date && (
                    <div style={{ color: "#a0aec0", fontSize: 11, marginTop: 3 }}>
                      {new Date(ride.ride_date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
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
    width: 30,
    height: 30,
    borderRadius: "50%",
    border: `1px solid ${disabled ? "rgba(255,255,255,.15)" : "rgba(212,175,55,.5)"}`,
    background: "transparent",
    color: disabled ? "#4a4f57" : GOLD,
    fontSize: 16,
    cursor: disabled ? "default" : "pointer",
  };
}
