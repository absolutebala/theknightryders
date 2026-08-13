"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressImage, jpegFilename } from "@/lib/imageCompression";

export default function CreateUpcomingRideButton({
  existingPhotos,
}: {
  existingPhotos: { url: string; title: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [rideDate, setRideDate] = useState(todayStr);
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [cost, setCost] = useState("");
  const [summary, setSummary] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const compressed = await compressImage(file);
      const path = `upcoming-rides/${Date.now()}-${jpegFilename(file.name)}`;
      const { error: uploadError } = await supabase.storage.from("homepage").upload(path, compressed);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from("homepage").getPublicUrl(path);
      setSelectedPhoto(publicUrlData.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !rideDate) {
      setError("Ride name and date are required.");
      return;
    }
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { error: createError } = await supabase.rpc("create_upcoming_ride", {
      p_title: title.trim(),
      p_place: place.trim() || null,
      p_ride_date: rideDate,
      p_end_date: isMultiDay && endDate ? endDate : null,
      p_is_multi_day: isMultiDay,
      p_cost_per_person: cost ? Number(cost) : null,
      p_summary: summary.trim() || null,
      p_hero_image_url: selectedPhoto,
    });

    if (createError) {
      setSaving(false);
      setError(createError.message);
      return;
    }

    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button type="button" className="btn btn-amber" onClick={() => setOpen(true)}>
        + Create Ride
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
            <h2 style={{ fontSize: 20, color: "var(--navy)", marginBottom: 18 }}>New Upcoming Ride</h2>

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
                  min={todayStr}
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
                style={{ ...fieldInput, resize: "vertical" }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={fieldLabel}>Photo (optional)</label>
              {selectedPhoto && (
                <div style={{ marginBottom: 8, position: "relative", width: 120 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedPhoto} alt="" style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 6 }} />
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(null)}
                    style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#a3312a", color: "#fff", border: "none", fontSize: 10, cursor: "pointer" }}
                  >
                    &#10005;
                  </button>
                </div>
              )}
              <label
                style={{
                  display: "inline-block",
                  fontSize: 12.5,
                  color: "var(--cta-blue)",
                  cursor: uploading ? "default" : "pointer",
                  marginBottom: 10,
                }}
              >
                {uploading ? "Uploading…" : "Upload a new photo"}
                <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display: "none" }} />
              </label>

              {existingPhotos.length > 0 && (
                <>
                  <div style={{ fontSize: 12, color: "var(--grey)", marginBottom: 6 }}>Or pick from a past ride:</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                    {existingPhotos.map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => setSelectedPhoto(p.url)}
                        title={p.title}
                        style={{
                          padding: 0,
                          border: selectedPhoto === p.url ? "2px solid var(--cta-blue)" : "2px solid transparent",
                          borderRadius: 6,
                          overflow: "hidden",
                          cursor: "pointer",
                          background: "none",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt={p.title} style={{ width: "100%", height: 50, objectFit: "cover", display: "block" }} />
                      </button>
                    ))}
                  </div>
                </>
              )}
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
                {saving ? "Creating…" : "Create Ride"}
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
