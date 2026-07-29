"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#d4af37";

export default function EliteNameEditor({
  memberId,
  isOwner,
  fullName,
}: {
  memberId: string;
  isOwner: boolean;
  fullName: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(fullName ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("members")
      .update({ full_name: nameInput.trim() || null })
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
      <div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            autoFocus
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 24,
              fontWeight: 700,
              color: GOLD,
              background: "rgba(0,0,0,.4)",
              border: `1.5px solid ${GOLD}`,
              borderRadius: 6,
              padding: "4px 10px",
            }}
          />
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

  return (
    <h1 style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {fullName ?? "Knight Ryder"}
      {isOwner && (
        <button type="button" aria-label="Edit name" onClick={() => setEditing(true)} style={pencilStyle}>
          &#9998;
        </button>
      )}
    </h1>
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
