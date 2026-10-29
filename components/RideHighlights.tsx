import { extractHighlights } from "@/lib/rideHighlights";

/**
 * Quick-scan "highlights" strip shown above a ride's full story. Content is
 * auto-extracted from the story text itself (lib/rideHighlights.ts) -- there
 * is no separate admin field to fill in. Renders nothing when the story is
 * too short/plain for anything to be worth pulling out.
 */
export default function RideHighlights({ description }: { description: string | null }) {
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
          <span style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--navy)", fontWeight: 600 }}>
            {h.text}
          </span>
        </div>
      ))}
    </div>
  );
}
