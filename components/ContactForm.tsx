"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const input: React.CSSProperties = {
  width: "100%",
  padding: "13px 16px",
  border: "1.5px solid transparent",
  background: "#f1f5f9",
  borderRadius: 12,
  fontSize: 15,
  fontFamily: "inherit",
};
const label: React.CSSProperties = { display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--navy)", marginBottom: 6, letterSpacing: ".02em" };

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "", website: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    // Hidden "website" field: real people leave it empty, bots fill it in.
    if (form.website) {
      setSent(true);
      return;
    }
    setSending(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("submit_contact_message", {
      p_name: form.name,
      p_email: form.email,
      p_phone: form.phone,
      p_subject: form.subject,
      p_message: form.message,
    });
    setSending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div style={{ background: "var(--mint)", borderRadius: 14, padding: "36px 28px", textAlign: "center" }}>
        <h2 style={{ color: "var(--navy)", margin: "0 0 8px" }}>Thank you!</h2>
        <p style={{ color: "var(--dark)", margin: 0 }}>Your message has been sent. We&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="contact-card">
      <h2 style={{ margin: "0 0 4px", color: "var(--navy)", fontSize: 22 }}>Send us a message</h2>
      <p style={{ margin: "0 0 20px", color: "var(--grey)", fontSize: 13.5 }}>We usually reply within a day.</p>
      <div className="contact-grid">
        <div>
          <label style={label}>Name <span style={{ color: "#c0392b" }}>*</span></label>
          <input className="contact-input" style={input} value={form.name} onChange={set("name")} required maxLength={120} />
        </div>
        <div>
          <label style={label}>Email <span style={{ color: "#c0392b" }}>*</span></label>
          <input className="contact-input" style={input} type="email" value={form.email} onChange={set("email")} required maxLength={200} />
        </div>
        <div>
          <label style={label}>Phone (optional)</label>
          <input className="contact-input" style={input} type="tel" value={form.phone} onChange={set("phone")} maxLength={40} />
        </div>
        <div>
          <label style={label}>Subject (optional)</label>
          <input className="contact-input" style={input} value={form.subject} onChange={set("subject")} maxLength={200} />
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <label style={label}>Message <span style={{ color: "#c0392b" }}>*</span></label>
        <textarea className="contact-input" style={{ ...input, minHeight: 140, resize: "vertical" }} value={form.message} onChange={set("message")} required maxLength={4000} />
      </div>
      <input
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={form.website}
        onChange={set("website")}
        style={{ position: "absolute", left: "-9999px", height: 0, width: 0, opacity: 0 }}
      />
      {error && <div style={{ color: "#a3312a", fontSize: 13, marginTop: 12 }}>{error}</div>}
      <button type="submit" className="btn btn-amber" disabled={sending} style={{ marginTop: 20, width: "100%", padding: "14px", borderRadius: 12, fontSize: 15 }}>
        {sending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
