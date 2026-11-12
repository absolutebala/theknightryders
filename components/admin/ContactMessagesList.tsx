"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function ContactMessagesList({ messages }: { messages: ContactMessage[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  async function toggleRead(m: ContactMessage) {
    setBusy(m.id);
    await createClient().rpc("set_contact_message_read", { p_id: m.id, p_read: !m.is_read });
    setBusy(null);
    router.refresh();
  }

  async function remove(m: ContactMessage) {
    if (!window.confirm(`Delete the message from ${m.name}?`)) return;
    setBusy(m.id);
    await createClient().rpc("delete_contact_message", { p_id: m.id });
    setBusy(null);
    router.refresh();
  }

  const shown = filter === "unread" ? messages.filter((m) => !m.is_read) : messages;
  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px",
              fontSize: 12.5,
              borderRadius: 16,
              border: "1px solid " + (filter === f ? "var(--navy)" : "#d8e0dc"),
              background: filter === f ? "var(--navy)" : "transparent",
              color: filter === f ? "#fff" : "var(--dark)",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {f === "all" ? `All (${messages.length})` : `Unread (${unread})`}
          </button>
        ))}
      </div>

      {shown.length === 0 && <p style={{ color: "var(--grey)", fontStyle: "italic" }}>No messages.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {shown.map((m) => (
          <div
            key={m.id}
            style={{
              background: "var(--white)",
              border: "1px solid #e3ebe7",
              borderLeft: `4px solid ${m.is_read ? "#d8e0dc" : "var(--amber)"}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <span style={{ fontWeight: 800, color: "var(--navy)", fontSize: 15 }}>{m.name}</span>
                {!m.is_read && (
                  <span style={{ marginLeft: 8, background: "var(--amber)", color: "#101a33", fontSize: 10.5, fontWeight: 800, padding: "2px 8px", borderRadius: 10 }}>
                    NEW
                  </span>
                )}
                <div style={{ fontSize: 13, color: "var(--grey)", marginTop: 2 }}>
                  <a href={`mailto:${m.email}`} style={{ color: "var(--cta-blue)" }}>{m.email}</a>
                  {m.phone && <> &middot; <a href={`tel:${m.phone}`} style={{ color: "var(--cta-blue)" }}>{m.phone}</a></>}
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--grey)" }}>
                {new Date(m.created_at).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "Asia/Kolkata",
                })}
              </div>
            </div>
            {m.subject && <div style={{ fontWeight: 700, color: "var(--dark)", marginTop: 10, fontSize: 14.5 }}>{m.subject}</div>}
            <p style={{ margin: "6px 0 0", whiteSpace: "pre-wrap", fontSize: 14.5, lineHeight: 1.6, color: "var(--dark)" }}>{m.message}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button type="button" disabled={busy === m.id} onClick={() => toggleRead(m)} style={{ padding: "5px 12px", fontSize: 12, borderRadius: 6, border: "1px solid #c7d3cf", background: "transparent", cursor: "pointer" }}>
                Mark as {m.is_read ? "unread" : "read"}
              </button>
              <button type="button" disabled={busy === m.id} onClick={() => remove(m)} style={{ padding: "5px 12px", fontSize: 12, borderRadius: 6, border: "1px solid #e8c4c0", color: "#a3312a", background: "transparent", cursor: "pointer" }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
