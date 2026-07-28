"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  sectionKey: string;
  column: "title" | "subtitle" | "body";
  value: string | null;
  isAdmin: boolean;
  as?: "h1" | "h2" | "span" | "p";
  multiline?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function EditableField({
  sectionKey,
  column,
  value,
  isAdmin,
  as = "span",
  multiline = false,
  className,
  style,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("homepage_content")
      .update({ [column]: text.trim() || null })
      .eq("section_key", sectionKey);
    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (!isAdmin) {
    if (!value) return null;
    const Tag = as;
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  if (editing) {
    return (
      <div style={{ display: "inline-block", width: "100%" }}>
        {multiline ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
            rows={4}
            style={{
              width: "100%",
              fontSize: 15,
              fontFamily: "inherit",
              border: "1.5px solid var(--cta-blue)",
              borderRadius: 8,
              padding: 10,
              resize: "vertical",
            }}
          />
        ) : (
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              fontSize: 15,
              fontFamily: "inherit",
              border: "1.5px solid var(--cta-blue)",
              borderRadius: 6,
              padding: "6px 10px",
            }}
          />
        )}
        {error && <div style={{ color: "#a3312a", fontSize: 12, marginTop: 4 }}>{error}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <button
            type="button"
            className="btn btn-amber"
            style={{ padding: "5px 14px", fontSize: 12 }}
            disabled={saving}
            onClick={save}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              setText(value ?? "");
              setEditing(false);
            }}
            style={{
              padding: "5px 14px",
              fontSize: 12,
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

  const Tag = as;
  return (
    <span style={{ display: "flex", alignItems: "flex-start", gap: 8, width: "100%" }}>
      <Tag className={className} style={{ ...style, margin: 0, flex: 1, minWidth: 0 }}>
        {value || <span style={{ opacity: 0.5, fontStyle: "italic" }}>(empty -- click to add)</span>}
      </Tag>
      <button
        type="button"
        aria-label={`Edit ${column}`}
        onClick={() => setEditing(true)}
        style={{
          flexShrink: 0,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "var(--mint)",
          color: "var(--navy)",
          fontSize: 10,
          cursor: "pointer",
          border: "none",
          marginTop: 4,
        }}
      >
        &#9998;
      </button>
    </span>
  );
}
