import { extractHighlights } from "@/lib/rideHighlights";
import { parseRideDetails, parseRideDays } from "@/lib/rideDetails";

/**
 * Quick-scan highlights shown above a ride's full story. If the story has
 * "Label: value" lines (Flag Off, Reached, Stay, Food, Route, Challenges)
 * they become labelled cards, with total duration computed from flag-off
 * and reached times. Otherwise falls back to auto-picked key sentences.
 */
export default function RideHighlights({ description }: { description: string | null }) {
  const days = parseRideDays(description);
  if (days) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 14,
          marginBottom: 28,
          alignItems: "start",
        }}
      >
        {days.map((d) => (
          <div
            key={d.label}
            style={{
              background: "var(--mint)",
              border: "1px solid #dce8e3",
              borderTop: "4px solid var(--cta-blue)",
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--cta-blue)" }}>
              {d.label}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--navy)", margin: "2px 0 10px" }}>{d.route}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {d.rows.map((r) => (
                <div key={r.label} style={{ fontSize: 13.5, lineHeight: 1.45, color: "var(--navy)" }}>
                  <span style={{ fontWeight: 800, color: "var(--cta-blue)" }}>
                    {r.icon} {r.label}:
                  </span>{" "}
                  <span style={{ fontWeight: 600 }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const details = parseRideDetails(description);

  if (details.length > 0) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 26,
        }}
      >
        {details.map((d) => (
          <div
            key={d.key}
            style={{
              gridColumn: d.wide ? "1 / -1" : undefined,
              background: "var(--mint)",
              border: "1px solid #dce8e3",
              borderLeft: "4px solid var(--cta-blue)",
              borderRadius: 10,
              padding: "12px 16px",
            }}
          >
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--cta-blue)",
                marginBottom: 4,
              }}
            >
              {d.icon} {d.label}
            </div>
            <div style={{ fontSize: 14.5, lineHeight: 1.5, color: "var(--navy)", fontWeight: 600 }}>{d.value}</div>
          </div>
        ))}
      </div>
    );
  }

  const highlights = extractHighlights(description);
  if (highlights.length === 0) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 12,
        marginBottom: 26,
      }}
    >
      {highlights.map((h, i) => (
        <div
          key={i}
          style={{
            background: "var(--mint)",
            border: "1px solid #dce8e3",
            borderRadius: 10,
            padding: "14px 16px",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1.3, flexShrink: 0 }}>{h.icon}</span>
          <span style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--navy)", fontWeight: 600 }}>{h.text}</span>
        </div>
      ))}
    </div>
  );
}
