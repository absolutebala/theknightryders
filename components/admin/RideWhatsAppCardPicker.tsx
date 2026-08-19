"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RideWhatsAppCardPicker({
  rideId,
  gallery,
  currentUrl,
}: {
  rideId: string;
  gallery: string[];
  currentUrl: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function choose(url: string | null) {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("set_ride_whatsapp_card_photo", { target_ride_id: rideId, new_url: url });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (gallery.length === 0) return null;

  return (
    <div style={{ marginTop: 14 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ fontSize: 12.5, color: "var(--cta-blue)", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}
      >
        {open ? "Hide" : currentUrl ? "Change" : "Set"} WhatsApp Status Photo (admin only)
      </button>

      {open && (
        <div style={{ marginTop: 10 }}>
          <p style={{ fontSize: 12, color: "var(--grey)", marginBottom: 10 }}>
            Pick which gallery photo visitors can download as a WhatsApp Status card for this ride.
          </p>
          {error && <div style={{ color: "#a3312a", fontSize: 12, marginBottom: 8 }}>{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8 }}>
            {gallery.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => choose(url)}
                disabled={busy}
                style={{
                  padding: 0,
                  border: currentUrl === url ? "3px solid var(--cta-blue)" : "3px solid transparent",
                  borderRadius: 6,
                  overflow: "hidden",
                  cursor: "pointer",
                  background: "none",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" style={{ width: "100%", height: 70, objectFit: "cover", display: "block" }} />
              </button>
            ))}
          </div>
          {currentUrl && (
            <button
              type="button"
              onClick={() => choose(null)}
              disabled={busy}
              style={{ marginTop: 10, fontSize: 11.5, color: "#a3312a", background: "none", border: "none", cursor: "pointer" }}
            >
              Clear selection
            </button>
          )}
        </div>
      )}
    </div>
  );
}
