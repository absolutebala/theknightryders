"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressImage, jpegFilename } from "@/lib/imageCompression";

type HolidayCard = {
  holiday_key: string;
  holiday_name: string;
  image_url: string | null;
};

export default function HolidayCardsManager({ cards }: { cards: HolidayCard[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(key: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusyKey(key);
    setError(null);
    try {
      const supabase = createClient();
      const compressed = await compressImage(file);
      const path = `holidays/${key}-${jpegFilename(file.name)}`;
      const { error: uploadError } = await supabase.storage.from("homepage").upload(path, compressed, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from("homepage").getPublicUrl(path);
      const { error: saveError } = await supabase.rpc("set_holiday_card_image", {
        target_key: key,
        new_url: publicUrlData.publicUrl,
      });
      if (saveError) throw saveError;
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleRemove(key: string) {
    setBusyKey(key);
    const supabase = createClient();
    const { error } = await supabase.rpc("set_holiday_card_image", { target_key: key, new_url: null });
    setBusyKey(null);
    if (error) return alert(error.message);
    router.refresh();
  }

  return (
    <section style={{ paddingTop: 0, paddingBottom: 40 }}>
      <div className="container">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={{ fontSize: 13, color: "var(--cta-blue)", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}
        >
          {open ? "Hide" : "Manage"} Holiday Cards (admin only)
        </button>

        {open && (
          <div style={{ marginTop: 14 }}>
            <p style={{ fontSize: 12.5, color: "var(--grey)", marginBottom: 14, maxWidth: 620 }}>
              Upload an image once per holiday -- it&apos;ll automatically show on the homepage on
              that day every year (dates for lunar/regional festivals are updated in code annually).
              Holidays with no image here just won&apos;t show a card.
            </p>
            {error && <div style={{ color: "#a3312a", fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
              {cards.map((c) => (
                <div key={c.holiday_key} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "3/4",
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "var(--mint)",
                      marginBottom: 6,
                      position: "relative",
                    }}
                  >
                    {c.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.image_url} alt={c.holiday_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 11, color: "var(--grey)", padding: 6, textAlign: "center" }}>
                        No image yet
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>{c.holiday_name}</div>
                  <label style={{ fontSize: 10.5, color: "var(--cta-blue)", cursor: "pointer" }}>
                    {busyKey === c.holiday_key ? "Working…" : c.image_url ? "Change" : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUpload(c.holiday_key, e)}
                      disabled={busyKey === c.holiday_key}
                      style={{ display: "none" }}
                    />
                  </label>
                  {c.image_url && (
                    <>
                      {" · "}
                      <button
                        type="button"
                        onClick={() => handleRemove(c.holiday_key)}
                        disabled={busyKey === c.holiday_key}
                        style={{ fontSize: 10.5, color: "#a3312a", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
