"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  memberId: string;
  isOwner: boolean;
  bio: string | null;
};

const SAMPLE_BIO =
  "Add a short bio to tell other riders a bit about yourself -- this placeholder is only visible to you.";

export default function ProfileBio({ memberId, isOwner, bio }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(bio ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("members")
      .update({ bio: value.trim() || null })
      .eq("id", memberId);
    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  // Public visitor, no bio: show nothing at all.
  if (!isOwner && !bio) {
    return null;
  }

  if (editing) {
    return (
      <div style={{ marginBottom: 30 }}>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          rows={3}
          placeholder="Tell other riders a bit about yourself..."
          style={{
            width: "100%",
            fontSize: 15,
            fontFamily: "inherit",
            border: "1.5px solid var(--cta-blue)",
            borderRadius: 8,
            padding: 12,
            resize: "vertical",
          }}
        />
        {error && <div style={{ color: "#a3312a", fontSize: 12.5, marginTop: 6 }}>{error}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            type="button"
            className="btn btn-amber"
            style={{ padding: "7px 16px", fontSize: 12.5 }}
            disabled={saving}
            onClick={save}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              setValue(bio ?? "");
              setEditing(false);
            }}
            style={{
              padding: "7px 16px",
              fontSize: 12.5,
              background: "transparent",
              border: "1px solid #c7d3cf",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <p
      style={{
        fontStyle: "italic",
        color: bio ? "var(--dark)" : "var(--grey)",
        fontSize: 17,
        lineHeight: 1.6,
        marginBottom: 30,
        borderLeft: "3px solid var(--amber)",
        paddingLeft: 18,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <span>&ldquo;{bio || SAMPLE_BIO}&rdquo;</span>
      {isOwner && (
        <button
          type="button"
          aria-label="Edit bio"
          onClick={() => setEditing(true)}
          style={{
            flexShrink: 0,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "var(--mint)",
            color: "var(--navy)",
            fontSize: 11,
            cursor: "pointer",
            border: "none",
            fontStyle: "normal",
          }}
        >
          &#9998;
        </button>
      )}
    </p>
  );
}
