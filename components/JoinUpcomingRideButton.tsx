"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/client";
import { compressImage, jpegFilename } from "@/lib/imageCompression";

const ADVANCE_AMOUNT = 500;
const DEFAULT_UPI_ID = "ramesh1979@okaxis";
const GEAR = ["Full-face helmet", "Riding jacket", "Riding pant", "Riding boots", "Gloves"];

export default function JoinUpcomingRideButton({
  upcomingRideId,
  initialStatus,
  rideTitle,
  cost,
  upiId,
  autoOpen = false,
}: {
  upcomingRideId: string;
  initialStatus: "pending" | "approved" | "rejected" | null;
  rideTitle: string;
  cost: number | null;
  upiId: string | null;
  autoOpen?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [open, setOpen] = useState(autoOpen);

  if (status === "approved") {
    return <span className="btn btn-outline" style={{ opacity: 0.7, cursor: "default" }}>You&apos;re Going &#10003;</span>;
  }
  if (status === "pending") {
    return <span className="btn btn-outline" style={{ opacity: 0.6, cursor: "default" }}>Request Pending</span>;
  }

  return (
    <>
      <button type="button" className="btn btn-amber" onClick={() => setOpen(true)}>
        {status === "rejected" ? "Request Again" : "Request to Join"}
      </button>
      {open && (
        <JoinModal
          upcomingRideId={upcomingRideId}
          rideTitle={rideTitle}
          cost={cost}
          upiId={upiId}
          onClose={() => setOpen(false)}
          onSubmitted={() => {
            setOpen(false);
            setStatus("pending");
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function JoinModal({
  upcomingRideId,
  rideTitle,
  cost,
  upiId,
  onClose,
  onSubmitted,
}: {
  upcomingRideId: string;
  rideTitle: string;
  cost: number | null;
  upiId: string | null;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const payTo = upiId || DEFAULT_UPI_ID;
  const [qr, setQr] = useState<string | null>(null);
  const [upiLink, setUpiLink] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [txn, setTxn] = useState("");
  const [shotUrl, setShotUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [gear, setGear] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const uri =
      `upi://pay?pa=${encodeURIComponent(payTo)}&pn=${encodeURIComponent("The Knight Ryders")}` +
      `&am=${ADVANCE_AMOUNT}` +
      `&cu=INR&tn=${encodeURIComponent(rideTitle.slice(0, 40))}`;
    setUpiLink(uri);
    QRCode.toDataURL(uri, { width: 320, margin: 1 }).then(setQr).catch(() => setQr(null));
  }, [payTo, rideTitle]);

  // Auto-populate everything we already know about the member
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: member }, { data: last }] = await Promise.all([
        supabase.from("members").select("full_name, vehicle_number").eq("user_id", user.id).maybeSingle(),
        supabase.rpc("get_my_last_registration"),
      ]);
      const prev = Array.isArray(last) ? last[0] : last;
      setName((n) => n || member?.full_name || user.user_metadata?.full_name || "");
      setVehicle((v) => v || member?.vehicle_number || prev?.vehicle_number || "");
      setPhone((p) => p || prev?.phone || user.phone || "");
    })();
  }, []);

  async function handleShot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in again.");
      const compressed = await compressImage(file);
      const clean = jpegFilename(file.name.replace(/[^a-zA-Z0-9.\-_]/g, ""));
      const path = `${user.id}/payments/${Date.now()}-${clean}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, compressed, { upsert: true, contentType: "image/jpeg" });
      if (upErr) throw upErr;
      setShotUrl(supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function toggleGear(g: string) {
    setGear((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim() || !vehicle.trim()) {
      setError("All fields are mandatory.");
      return;
    }
    if (!txn.trim() && !shotUrl) {
      setError("Enter the UPI transaction number or upload the payment screenshot.");
      return;
    }
    if (gear.length !== GEAR.length) {
      setError("Please confirm you will wear all the riding gear.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("submit_upcoming_ride_registration", {
      p_ride: upcomingRideId,
      p_name: name,
      p_phone: phone,
      p_vehicle: vehicle,
      p_upi_txn: txn,
      p_gear: gear,
      p_screenshot_url: shotUrl,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSubmitted();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => !saving && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5,8,15,.7)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 14,
          width: "100%",
          maxWidth: 820,
          maxHeight: "92vh",
          overflowY: "auto",
          padding: 26,
          borderTop: "5px solid var(--amber)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h2 style={{ color: "var(--navy)", fontSize: 21, margin: 0 }}>
              Do the advance payment of INR {ADVANCE_AMOUNT} for the confirmation
            </h2>
            <div style={{ color: "#a3312a", fontSize: 12, fontWeight: 600, marginTop: 3 }}>Non-refundable</div>
            <div style={{ color: "var(--grey)", fontSize: 13.5, marginTop: 4 }}>{rideTitle}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--grey)" }}>
            &times;
          </button>
        </div>

        <div className="join-modal-grid">
          <div style={{ textAlign: "center" }}>
            {qr ? (
              // Tapping the QR on a phone opens the UPI app chooser
              <a href={upiLink} aria-label="Pay with UPI app">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="UPI payment QR code" style={{ width: "100%", maxWidth: 260, borderRadius: 10, border: "1px solid #e3ebe7" }} />
              </a>
            ) : (
              <div style={{ color: "var(--grey)", fontSize: 13 }}>Generating QR…</div>
            )}
            <a href={upiLink} className="btn btn-amber upi-pay-btn" style={{ marginTop: 12, padding: "9px 18px", fontSize: 13 }}>
              Pay with UPI app
            </a>
            <div style={{ fontSize: 12.5, color: "var(--grey)", marginTop: 4 }}>On mobile, tap the QR or this button</div>
            <div style={{ fontSize: 13, color: "var(--dark)", marginTop: 8, fontWeight: 600 }}>UPI ID: {payTo}</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: 10, fontSize: 14 }}>Your details</div>
            <Field label="Name" value={name} onChange={setName} />
            <Field label="Phone number" value={phone} onChange={setPhone} type="tel" />
            <Field label="Vehicle number" value={vehicle} onChange={setVehicle} />
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--dark)", marginBottom: 4 }}>
                Payment proof <span style={{ color: "#c0392b" }}>*</span>
              </label>
              <input
                value={txn}
                onChange={(e) => setTxn(e.target.value)}
                placeholder="UPI transaction number"
                style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #c7d3cf", borderRadius: 6, fontSize: 14 }}
              />
              <div style={{ textAlign: "center", fontSize: 12, color: "var(--grey)", margin: "6px 0" }}>or</div>
              <input id="payment-shot" type="file" accept="image/*" onChange={handleShot} style={{ display: "none" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <label htmlFor="payment-shot" className="btn btn-outline" style={{ padding: "7px 14px", fontSize: 12.5, cursor: "pointer" }}>
                  {uploading ? "Uploading…" : shotUrl ? "Change screenshot" : "Upload payment screenshot"}
                </label>
                {shotUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={shotUrl} alt="Payment screenshot" style={{ height: 44, borderRadius: 6, border: "1px solid #e3ebe7" }} />
                )}
              </div>
            </div>

            <div style={{ fontWeight: 700, color: "var(--navy)", margin: "14px 0 6px", fontSize: 14 }}>
              I will ride with
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 10px" }}>
              {GEAR.map((g) => (
                <label key={g} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5, cursor: "pointer" }}>
                  <input type="checkbox" checked={gear.includes(g)} onChange={() => toggleGear(g)} />
                  {g}
                </label>
              ))}
            </div>
          </div>
        </div>

        {error && <div style={{ color: "#a3312a", fontSize: 13, marginTop: 14 }}>{error}</div>}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
          <button type="button" onClick={onClose} disabled={saving} style={{ padding: "9px 18px", background: "transparent", border: "1px solid #c7d3cf", borderRadius: 6, cursor: "pointer", fontSize: 13.5 }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-amber" disabled={saving}>
            {saving ? "Submitting…" : "Submit for Approval"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--dark)", marginBottom: 4 }}>
        {label} <span style={{ color: "#c0392b" }}>*</span>
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #c7d3cf", borderRadius: 6, fontSize: 14 }}
      />
    </div>
  );
}
