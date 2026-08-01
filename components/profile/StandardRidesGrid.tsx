"use client";

import { useRef, useState } from "react";

type Ride = {
  id: string;
  slug: string;
  title: string;
  ride_date: string | null;
  hero_image_url: string | null;
};

const PAGE_SIZE = 15;

export default function StandardRidesGrid({ rides }: { rides: Ride[] }) {
  const [page, setPage] = useState(0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const totalPages = Math.ceil(rides.length / PAGE_SIZE);
  const visible = rides.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  function goToPage(next: number) {
    setPage(next);
    titleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <h2 ref={titleRef} style={{ fontSize: 20, color: "var(--navy)", marginBottom: 16 }}>
        Rides
      </h2>

      {rides.length === 0 ? (
        <p style={{ color: "var(--grey)" }}>No ride history linked yet.</p>
      ) : (
        <>
          <div className="past-rides-grid past-rides-grid-2col">
            {visible.map((ride) => (
              <a key={ride.id} href={`/rides/${ride.slug}`}>
                <figure>
                  {ride.hero_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ride.hero_image_url} alt={ride.title} />
                  ) : (
                    <div className="no-image">{ride.title}</div>
                  )}
                  <figcaption>
                    {ride.title}
                    {ride.ride_date && (
                      <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2, fontWeight: 500 }}>
                        {new Date(ride.ride_date).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    )}
                  </figcaption>
                </figure>
              </a>
            ))}
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
              <span style={{ color: "var(--grey)", fontSize: 12.5 }}>
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
    </>
  );
}

function navBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: `1px solid ${disabled ? "#d6dedb" : "var(--navy)"}`,
    background: "transparent",
    color: disabled ? "#b7c1bd" : "var(--navy)",
    fontSize: 14,
    cursor: disabled ? "default" : "pointer",
  };
}
