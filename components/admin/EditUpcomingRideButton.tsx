"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type RideValues = {
  id: string;
  title: string;
  place: string | null;
  ride_date: string;
  end_date: string | null;
  is_multi_day: boolean;
  cost_per_person: number | null;
  summary: string | null;
};

export default function EditUpcomingRideButton({ ride }: { ride: RideValues }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(ride.title);
  const [place, setPlace] = useState(ride.place ?? "");
  const [rideDate, setRideDate] = useState(ride.ride_date);
  const [isMultiDay, setIsMultiDay] = useState(ride.is_multi_day);
  const [endDate, setEndDate] = useState(ride.end_date ?? "");
  const [cost, setCost] = useState(ride.cost_per_person?.toString() ?? "");
  const [summary, setSummary] = useState(ride.summary ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !rideDate) {
      setError("Ride name and date are required.");
      return;
    }
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase.rpc("update_upcoming_ride", {
      target_id: ride.id,
      p_title: title.trim(),
      p_place: place.trim() || null,
      p_ride_date: rideDate,
      p_end_date: isMultiDay && endDate ? endDate : null,
      p_is_multi_day: isMultiDay,
      p_cost_per_person: cost ? Number(cost) : null,
      p_summary: summary.trim() || null,
    });

    if (updateError) {
      setSaving(false);
      setError(updateError.message);
      return;
    }

    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          background: "rgba(255,255,255,.9)",
          border: "none",
          borderRadius: 20,
          padding: "6px 16px",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Edit Ride Details
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
          onClick={() => !saving && setOpen(false)}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--white)",
              borderRadius: 14,
              padding: 28,
              width: "100%",
              maxWidth: 520,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{ fontSize: 20, color: "var(--navy)", marginBottom: 18 }}>Edit Ride Details</h2>

            {error && <div style={{ color: "#a3312a", fontSize: 13, marginBottom: 12 }}>{error}</div>}

            <div style={{ marginBottom: 14 }}>
              <label style={fieldLabel}>Ride Name</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required style={fieldInput} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={fieldLabel}>Place</label>
              <input value={place} onChange={(e) => setPlace(e.target.value)} style={fieldInput} />
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, cursor: "pointer" }}>
                <input type="checkbox" checked={isMultiDay} onChange={(e) => setIsMultiDay(e.target.checked)} />
                Multiple days
              </label>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={fieldLabel}>{isMultiDay ? "Start Date" : "Ride Date"}</label>
                <input
                  type="date"
                  value={rideDate}
                  onChange={(e) => setRideDate(e.target.value)}
                  required
                  style={fieldInput}
                />
              </div>
              {isMultiDay && (
                <div style={{ flex: 1 }}>
                  <label style={fieldLabel}>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={rideDate}
                    style={fieldInput}
                  />
                </div>
              )}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={fieldLabel}>Cost Per Person (&#8377;)</label>
              <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} style={fieldInput} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={fieldLabel}>Ride Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                placeholder="Add a summary for this ride..."
                style={{ ...fieldInput, resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                style={{ padding: "9px 18px", background: "transparent", border: "1px solid #c7d3cf", borderRadius: 6, cursor: "pointer", fontSize: 13.5 }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-amber" disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

const fieldLabel: React.CSSProperties = { display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--dark)", marginBottom: 6 };
const fieldInput: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1.5px solid #c7d3cf", borderRadius: 6, fontSize: 14 };
