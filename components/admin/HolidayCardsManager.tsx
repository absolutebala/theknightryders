"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressImage, jpegFilename } from "@/lib/imageCompression";

type HolidayCard = {
  holiday_key: string;
  holiday_name: string;
  image_url: string | null;
  holiday_date: string | null;
  wish_text: string | null;
};

function HolidayCardEditor({ card }: { card: HolidayCard }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(card.holiday_date ?? "");
  const [wish, setWish] = useState(card.wish_text ?? "");

  async function save(overrides: { url?: string | null; date?: string; wish?: string }) {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("update_holiday_card", {
      target_key: card.holiday_key,
      new_url: overrides.url !== undefined ? overrides.url : card.image_url,
      new_date: overrides.date ?? date,
      new_wish: overrides.wish ?? wish,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const compressed = await compressImage(file);
      const path = `holidays/${card.holiday_key}-${jpegFilename(file.name)}`;
      const { error: uploadError } = await supabase.storage.from("homepage").upload(path, compressed, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from("homepage").getPublicUrl(path);
      setBusy(false);
      await save({ url: publicUrlData.publicUrl });
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <div style={{ background: "var(--white)", border: "1px solid #e3ebe7", borderRadius: 10, padding: 12 }}>
      <div
        style={{
          width: "100%",
          aspectRatio: "3/4",
          borderRadius: 8,
          overflow: "hidden",
          background: "var(--mint)",
          marginBottom: 8,
        }}
      >
        {card.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.image_url} alt={card.holiday_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 11, color: "var(--grey)", padding: 6, textAlign: "center" }}>
            No image yet
          </div>
        )}
      </div>

      <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>{card.holiday_name}</div>

      {error && <div style={{ color: "#a3312a", fontSize: 10.5, marginBottom: 6 }}>{error}</div>}

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <label style={{ fontSize: 10.5, color: "var(--cta-blue)", cursor: "pointer" }}>
          {busy ? "Working…" : card.image_url ? "Change Photo" : "Upload"}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={busy} style={{ display: "none" }} />
        </label>
        {card.image_url && (
          <button
            type="button"
            onClick={() => save({ url: null })}
            disabled={busy}
            style={{ fontSize: 10.5, color: "#a3312a", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            Remove
          </button>
        )}
      </div>

      <label style={{ display: "block", fontSize: 10, color: "var(--grey)", marginBottom: 3 }}>Date this year</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        onBlur={() => date !== (card.holiday_date ?? "") && save({ date })}
        disabled={busy}
        style={{ width: "100%", padding: "5px 8px", fontSize: 11.5, border: "1px solid #c7d3cf", borderRadius: 5, marginBottom: 8 }}
      />

      <label style={{ display: "block", fontSize: 10, color: "var(--grey)", marginBottom: 3 }}>Wish text</label>
      <textarea
        value={wish}
        onChange={(e) => setWish(e.target.value)}
        onBlur={() => wish !== (card.wish_text ?? "") && save({ wish })}
        disabled={busy}
        rows={3}
        style={{ width: "100%", padding: "5px 8px", fontSize: 11, border: "1px solid #c7d3cf", borderRadius: 5, resize: "vertical" }}
      />
    </div>
  );
}

export default function HolidayCardsManager({
  cards,
  openByDefault = false,
}: {
  cards: HolidayCard[];
  openByDefault?: boolean;
}) {
  const [open, setOpen] = useState(openByDefault);

  return (
    <section id="holiday-cards" style={{ paddingTop: 0, paddingBottom: 40 }}>
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
            <p style={{ fontSize: 12.5, color: "var(--grey)", marginBottom: 14, maxWidth: 640 }}>
              Upload an image, set this year&apos;s date, and write a wish for each holiday --
              everything here (except the image) is saved as soon as you click away from the field.
              Holidays with no image just won&apos;t show a card. Dates for lunar/regional festivals
              shift every year, so you&apos;ll want to update those annually.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
              {cards.map((c) => (
                <HolidayCardEditor key={c.holiday_key} card={c} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
