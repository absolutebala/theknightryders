"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { parseItinerary } from "@/lib/parseItinerary";

export default function RideDescriptionEditor({
  rideId,
  description,
  fallbackText,
  isAdmin,
}: {
  rideId: string;
  description: string | null;
  fallbackText: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("rides")
      .update({ description: draft.trim() || null })
      .eq("id", rideId);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          rows={6}
          placeholder="Write about this ride -- the route, the highlights, what made it memorable..."
          style={{
            width: "100%",
            fontFamily: "inherit",
            fontSize: 15.5,
            lineHeight: 1.8,
            color: "var(--dark)",
            border: "1.5px solid var(--cta-blue)",
            borderRadius: 8,
            padding: "12px 14px",
            resize: "vertical",
          }}
        />
        {error && <div style={{ color: "#a3312a", fontSize: 12, marginTop: 6 }}>{error}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button type="button" className="btn btn-amber" style={{ padding: "8px 18px", fontSize: 13 }} disabled={saving} onClick={save}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(description ?? "");
              setEditing(false);
            }}
            style={{
              padding: "8px 18px",
              fontSize: 13,
              background: "transparent",
              border: "1px solid #c7d3cf",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const itinerary = description ? parseItinerary(description) : null;

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div style={{ flex: 1 }}>
        {itinerary ? (
          <div>
            {itinerary.intro && (
              <p style={{ color: "var(--dark)", fontSize: 15.5, lineHeight: 1.7, marginTop: 0, marginBottom: 20 }}>
                {itinerary.intro}
              </p>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
                alignItems: "start",
              }}
            >
              {itinerary.days.map((day, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--white)",
                    border: "1px solid #e3ebe7",
                    borderRadius: 10,
                    padding: "14px 18px",
                  }}
                >
                  <div style={{ fontWeight: 800, color: "var(--navy)", fontSize: 14.5, marginBottom: 8 }}>
                    {day.label}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {day.meals.map((m, j) => (
                      <div key={j} style={{ display: "flex", gap: 8, fontSize: 14, lineHeight: 1.5 }}>
                        <span style={{ color: "var(--cta-blue)", fontWeight: 700, minWidth: 68 }}>
                          {m.meal}
                        </span>
                        <span style={{ color: "var(--dark)" }}>{m.place}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p
            style={{
              color: description ? "var(--dark)" : "var(--grey)",
              fontStyle: description ? "normal" : "italic",
              whiteSpace: "pre-line",
              lineHeight: 1.8,
              fontSize: 15.5,
              margin: 0,
            }}
          >
            {description || fallbackText}
          </p>
        )}
      </div>
      {isAdmin && (
        <button
          type="button"
          aria-label="Edit description"
          onClick={() => setEditing(true)}
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            border: "1px solid var(--cta-blue)",
            background: "var(--white)",
            color: "var(--cta-blue)",
            fontSize: 11,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          &#9998;
        </button>
      )}
    </div>
  );
}
