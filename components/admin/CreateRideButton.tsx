"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CreateRideButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [rideDate, setRideDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setSaving(true);
    setError(null);

    const finalTitle = title.trim() || "New Ride";
    const base = slugify(finalTitle) || "ride";
    const slug = `${base}-${Date.now().toString(36)}`;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("rides")
      .insert({
        title: finalTitle,
        slug,
        ride_date: rideDate || null,
      })
      .select("slug")
      .single();

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(`/rides/${data.slug}`);
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-amber"
        style={{ padding: "10px 22px", fontSize: 13 }}
        onClick={() => setOpen(true)}
      >
        + Add New Ride
      </button>

      {open && (
        <div
          onClick={() => !saving && setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(23,37,42,.6)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 400,
              maxWidth: "100%",
              background: "var(--white)",
              borderRadius: 14,
              padding: "28px 26px",
              boxShadow: "0 20px 50px rgba(0,0,0,.25)",
            }}
          >
            <h2 style={{ fontSize: 19, color: "var(--navy)", marginBottom: 6 }}>Add New Ride</h2>
            <p style={{ fontSize: 12.5, color: "var(--grey)", marginBottom: 20 }}>
              Everything here is optional -- add a photo, description, and riders afterward on
              the ride's own page.
            </p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--dark)", display: "block", marginBottom: 6 }}>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Ride #89 : Yelagiri Ride"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: "1.5px solid #c7d3cf",
                  borderRadius: 6,
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--dark)", display: "block", marginBottom: 6 }}>
                Ride Date
              </label>
              <input
                type="date"
                value={rideDate}
                onChange={(e) => setRideDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: "1.5px solid #c7d3cf",
                  borderRadius: 6,
                  fontSize: 14,
                }}
              />
            </div>

            {error && <div style={{ color: "#a3312a", fontSize: 12.5, marginBottom: 14 }}>{error}</div>}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="btn btn-amber"
                style={{ padding: "9px 22px", fontSize: 13 }}
                disabled={saving}
                onClick={handleCreate}
              >
                {saving ? "Creating…" : "Create Ride"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                style={{
                  padding: "9px 22px",
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
        </div>
      )}
    </>
  );
}
