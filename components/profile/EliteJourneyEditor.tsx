"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#d4af37";

export default function EliteJourneyEditor({
  memberId,
  isOwner,
  journeyText,
  generatedNarrative,
}: {
  memberId: string;
  isOwner: boolean;
  journeyText: string | null;
  generatedNarrative: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [textInput, setTextInput] = useState(journeyText ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayText = journeyText || generatedNarrative;
  const isCustom = !!journeyText;

  async function save() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("members")
      .update({ journey_text: textInput.trim() || null })
      .eq("id", memberId);
    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  return (
    <div>
      <div className="elite-section-header" style={{ position: "relative" }}>
        <h2>My Journey</h2>
        {isOwner && !editing && (
          <button
            type="button"
            aria-label="Edit My Journey"
            onClick={() => {
              setTextInput(journeyText ?? generatedNarrative);
              setEditing(true);
            }}
            style={{
              position: "absolute",
              top: 4,
              right: 0,
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "rgba(212,175,55,.15)",
              border: `1px solid ${GOLD}`,
              color: GOLD,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            &#9998;
          </button>
        )}
      </div>

      {editing ? (
        <div
          style={{
            background: "var(--elite-glass-panel)",
            backdropFilter: "blur(12px)",
            border: `1.5px solid ${GOLD}`,
            borderRadius: 14,
            padding: "20px 24px",
          }}
        >
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            autoFocus
            rows={6}
            style={{
              width: "100%",
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              lineHeight: 1.7,
              color: "#e2e5ea",
              background: "rgba(0,0,0,.3)",
              border: "1px solid rgba(255,255,255,.15)",
              borderRadius: 8,
              padding: "12px 14px",
              resize: "vertical",
            }}
          />
          {error && <div style={{ color: "#e08a7d", fontSize: 12, marginTop: 8 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              type="button"
              disabled={saving}
              onClick={save}
              style={{
                padding: "7px 20px",
                fontSize: 12,
                fontWeight: 700,
                background: `linear-gradient(135deg, ${GOLD}, #8a6d1c)`,
                color: "#000",
                border: "none",
                borderRadius: 20,
                cursor: "pointer",
              }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              style={{
                padding: "7px 20px",
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
            {isCustom && (
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  setTextInput("");
                  setSaving(true);
                  const supabase = createClient();
                  const { error } = await supabase
                    .from("members")
                    .update({ journey_text: null })
                    .eq("id", memberId);
                  setSaving(false);
                  if (!error) {
                    setEditing(false);
                    router.refresh();
                  } else {
                    setError(error.message);
                  }
                }}
                style={{
                  padding: "7px 20px",
                  fontSize: 12,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,.15)",
                  borderRadius: 20,
                  color: "#8b929c",
                  cursor: "pointer",
                  marginLeft: "auto",
                }}
              >
                Reset to auto-generated
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "var(--elite-glass-panel)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--elite-glass-border)",
            borderRadius: 14,
            padding: "24px 28px",
          }}
        >
          <p style={{ color: "#e2e5ea", fontSize: 15, lineHeight: 1.8, margin: 0 }}>{displayText}</p>
        </div>
      )}
    </div>
  );
}
