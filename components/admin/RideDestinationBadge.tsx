"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RideDestinationBadge({
  rideId,
  destination,
  isAdmin,
}: {
  rideId: string;
  destination: string | null;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(destination ?? "");
  const [saving, setSaving] = useState(false);

  async function save(e: React.MouseEvent | React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("rides")
      .update({ destination: draft.trim() || null })
      .eq("id", rideId);
    setSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <form
        onClick={(e) => e.preventDefault()}
        onSubmit={save}
        className="past-rides-destination-label"
        style={{ display: "flex", gap: 4, padding: 4 }}
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 110,
            border: "none",
            borderRadius: 8,
            padding: "3px 8px",
            fontSize: 11.5,
          }}
        />
        <button
          type="submit"
          disabled={saving}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "var(--amber)",
            border: "none",
            borderRadius: 8,
            padding: "3px 8px",
            fontSize: 10.5,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {saving ? "…" : "Save"}
        </button>
      </form>
    );
  }

  return (
    <div className="past-rides-destination-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {destination || "Add destination"}
      {isAdmin && (
        <button
          type="button"
          aria-label="Edit destination"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setEditing(true);
          }}
          style={{
            background: "none",
            border: "none",
            color: "inherit",
            fontSize: 10,
            cursor: "pointer",
            padding: 0,
          }}
        >
          &#9998;
        </button>
      )}
    </div>
  );
}
