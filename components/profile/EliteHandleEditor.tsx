"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#d4af37";

export default function EliteHandleEditor({
  memberId,
  isOwner,
  handle,
}: {
  memberId: string;
  isOwner: boolean;
  handle: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [handleInput, setHandleInput] = useState(handle ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("members")
      .update({ handle: handleInput.trim() || null })
      .eq("id", memberId);
    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (!handle && !isOwner) return null;

  if (editing) {
    return (
      <div style={{ marginTop: 6 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "#9aa1ab", fontSize: 14 }}>@</span>
          <input
            type="text"
            value={handleInput}
            onChange={(e) => setHandleInput(e.target.value.replace(/[^a-zA-Z0-9_.]/g, ""))}
            autoFocus
            placeholder="yourhandle"
            style={{
              fontSize: 14,
              color: GOLD,
              background: "rgba(0,0,0,.4)",
              border: `1.5px solid ${GOLD}`,
              borderRadius: 6,
              padding: "4px 10px",
              width: 160,
            }}
          />
          <button
            type="button"
            disabled={saving}
            onClick={save}
            style={{
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 700,
              background: `linear-gradient(135deg, ${GOLD}, #8a6d1c)`,
              color: "#000",
              border: "none",
              borderRadius: 20,
              cursor: "pointer",
            }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            style={{
              padding: "5px 14px",
              fontSize: 12,
              background: "transparent",
              border: "1px solid rgba(255,255,255,.25)",
              borderRadius: 20,
              color: "#e8e8e8",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
        {error && <div style={{ color: "#e08a7d", fontSize: 12, marginTop: 6 }}>{error}</div>}
      </div>
    );
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {handle ? (
        `@${handle}`
      ) : (
        <span style={{ fontStyle: "italic", opacity: 0.7 }}>@ add your handle</span>
      )}
      {isOwner && (
        <button
          type="button"
          aria-label="Edit handle"
          onClick={() => setEditing(true)}
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "rgba(212,175,55,.15)",
            border: `1px solid ${GOLD}`,
            color: GOLD,
            fontSize: 9,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          &#9998;
        </button>
      )}
    </span>
  );
}
