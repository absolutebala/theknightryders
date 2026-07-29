"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#d4af37";

export default function EliteBioEditor({
  memberId,
  isOwner,
  bio,
}: {
  memberId: string;
  isOwner: boolean;
  bio: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [bioInput, setBioInput] = useState(bio ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("members")
      .update({ bio: bioInput.trim() || null })
      .eq("id", memberId);
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
      <div style={{ marginTop: 14 }}>
        <textarea
          value={bioInput}
          onChange={(e) => setBioInput(e.target.value)}
          autoFocus
          rows={3}
          placeholder="Tell other riders a bit about yourself..."
          style={{
            width: "100%",
            fontFamily: "'Caveat', cursive",
            fontSize: 20,
            color: "#f1f5f9",
            background: "rgba(0,0,0,.3)",
            border: `1.5px solid ${GOLD}`,
            borderRadius: 8,
            padding: "10px 14px",
            resize: "vertical",
          }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button type="button" disabled={saving} onClick={save} style={saveBtnStyle}>
            Save
          </button>
          <button type="button" onClick={() => setEditing(false)} style={cancelBtnStyle}>
            Cancel
          </button>
        </div>
        {error && <div style={{ color: "#e08a7d", fontSize: 12, marginTop: 6 }}>{error}</div>}
      </div>
    );
  }

  if (!bio && !isOwner) return null;

  return (
    <div className="elite-quote-block" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ flex: 1 }}>
        {bio ? (
          <>&ldquo;{bio}&rdquo;</>
        ) : (
          <span style={{ opacity: 0.6 }}>
            Add a short bio to tell other riders about yourself -- only you see this prompt.
          </span>
        )}
      </span>
      {isOwner && (
        <button
          type="button"
          aria-label="Edit bio"
          onClick={() => setEditing(true)}
          style={{ ...pencilStyle, flexShrink: 0 }}
        >
          &#9998;
        </button>
      )}
    </div>
  );
}

const pencilStyle: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: "50%",
  background: "rgba(212,175,55,.15)",
  border: `1px solid ${GOLD}`,
  color: GOLD,
  fontSize: 10,
  cursor: "pointer",
  flexShrink: 0,
};

const saveBtnStyle: React.CSSProperties = {
  padding: "6px 16px",
  fontSize: 12,
  fontWeight: 700,
  background: `linear-gradient(135deg, ${GOLD}, #8a6d1c)`,
  color: "#000",
  border: "none",
  borderRadius: 20,
  cursor: "pointer",
};

const cancelBtnStyle: React.CSSProperties = {
  padding: "6px 16px",
  fontSize: 12,
  background: "transparent",
  border: "1px solid rgba(255,255,255,.25)",
  borderRadius: 20,
  color: "#e8e8e8",
  cursor: "pointer",
};
