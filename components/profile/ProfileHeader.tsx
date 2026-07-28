"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  memberId: string;
  isOwner: boolean;
  fullName: string | null;
  handle: string | null;
  dateOfBirth: string | null;
  profilePhotoUrl: string | null;
};

type EditField = "photo" | "name" | "handle" | "dob" | null;

const pencilStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 22,
  height: 22,
  borderRadius: "50%",
  background: "var(--mint)",
  color: "var(--navy)",
  fontSize: 11,
  cursor: "pointer",
  border: "none",
  marginLeft: 8,
  flexShrink: 0,
};

export default function ProfileHeader({
  memberId,
  isOwner,
  fullName,
  handle,
  dateOfBirth,
  profilePhotoUrl,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<EditField>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [nameInput, setNameInput] = useState(fullName ?? "");
  const [handleInput, setHandleInput] = useState(handle ?? "");
  const [dobInput, setDobInput] = useState(dateOfBirth ?? "");
  const [photoInput, setPhotoInput] = useState(profilePhotoUrl ?? "");

  async function save(column: string, value: string) {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("members")
      .update({ [column]: value.trim() || null })
      .eq("id", memberId);
    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }
    setEditing(null);
    router.refresh();
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 20,
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
        {/* Photo */}
        <div style={{ position: "relative" }}>
          {profilePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profilePhotoUrl}
              alt={fullName ?? "Profile photo"}
              style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                background: "var(--navy)",
                color: "var(--mint-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34,
                fontWeight: 800,
              }}
            >
              {(fullName ?? "?").charAt(0).toUpperCase()}
            </div>
          )}
          {isOwner && (
            <button
              type="button"
              aria-label="Edit photo"
              onClick={() => setEditing(editing === "photo" ? null : "photo")}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "var(--amber)",
                color: "var(--navy)",
                border: "2px solid var(--white)",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              &#9998;
            </button>
          )}
          {editing === "photo" && (
            <div
              style={{
                position: "absolute",
                top: "115%",
                left: 0,
                zIndex: 10,
                background: "var(--white)",
                border: "1px solid #d6dedb",
                borderRadius: 10,
                padding: 12,
                width: 260,
                boxShadow: "0 6px 20px rgba(0,0,0,.12)",
              }}
            >
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--navy)" }}>
                Photo URL
              </label>
              <input
                type="text"
                value={photoInput}
                onChange={(e) => setPhotoInput(e.target.value)}
                placeholder="https://..."
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  margin: "6px 0 10px",
                  border: "1.5px solid #c7d3cf",
                  borderRadius: 6,
                  fontSize: 13,
                }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-amber"
                  style={{ padding: "6px 14px", fontSize: 12 }}
                  disabled={saving}
                  onClick={() => save("profile_photo_url", photoInput)}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  style={{
                    padding: "6px 14px",
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
          )}
        </div>

        <div>
          {/* Name */}
          {editing === "name" ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoFocus
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "var(--navy)",
                  border: "1.5px solid var(--cta-blue)",
                  borderRadius: 6,
                  padding: "4px 8px",
                }}
              />
              <button
                type="button"
                className="btn btn-amber"
                style={{ padding: "6px 14px", fontSize: 12 }}
                disabled={saving}
                onClick={() => save("full_name", nameInput)}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                style={{
                  padding: "6px 14px",
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
          ) : (
            <h1 style={{ color: "var(--navy)", display: "flex", alignItems: "center" }}>
              {fullName ?? "Knight Ryder"}
              {isOwner && (
                <button
                  type="button"
                  aria-label="Edit name"
                  style={pencilStyle}
                  onClick={() => setEditing("name")}
                >
                  &#9998;
                </button>
              )}
            </h1>
          )}

          {/* Handle */}
          {editing === "handle" ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
              <span style={{ color: "var(--grey)", fontSize: 15 }}>@</span>
              <input
                type="text"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value.replace(/[^a-zA-Z0-9_.]/g, ""))}
                autoFocus
                placeholder="yourhandle"
                style={{
                  fontSize: 14,
                  border: "1.5px solid var(--cta-blue)",
                  borderRadius: 6,
                  padding: "4px 8px",
                  width: 160,
                }}
              />
              <button
                type="button"
                className="btn btn-amber"
                style={{ padding: "5px 12px", fontSize: 12 }}
                disabled={saving}
                onClick={() => save("handle", handleInput)}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                style={{
                  padding: "5px 12px",
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
          ) : (
            (handle || isOwner) && (
              <p style={{ color: "var(--grey)", fontSize: 14, marginTop: 6, display: "flex", alignItems: "center" }}>
                {handle ? `@${handle}` : <span style={{ fontStyle: "italic" }}>@ add your handle</span>}
                {isOwner && (
                  <button
                    type="button"
                    aria-label="Edit handle"
                    style={pencilStyle}
                    onClick={() => setEditing("handle")}
                  >
                    &#9998;
                  </button>
                )}
              </p>
            )
          )}

          {/* DOB */}
          {editing === "dob" ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
              <input
                type="date"
                value={dobInput}
                onChange={(e) => setDobInput(e.target.value)}
                autoFocus
                style={{
                  fontSize: 13,
                  border: "1.5px solid var(--cta-blue)",
                  borderRadius: 6,
                  padding: "4px 8px",
                }}
              />
              <button
                type="button"
                className="btn btn-amber"
                style={{ padding: "5px 12px", fontSize: 12 }}
                disabled={saving}
                onClick={() => save("date_of_birth", dobInput)}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                style={{
                  padding: "5px 12px",
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
          ) : (
            (dateOfBirth || isOwner) && (
              <p style={{ color: "var(--grey)", fontSize: 14, marginTop: 4, display: "flex", alignItems: "center" }}>
                {dateOfBirth ? (
                  `Born ${new Date(dateOfBirth).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}`
                ) : (
                  <span style={{ fontStyle: "italic" }}>Add your date of birth</span>
                )}
                {isOwner && (
                  <button
                    type="button"
                    aria-label="Edit date of birth"
                    style={pencilStyle}
                    onClick={() => setEditing("dob")}
                  >
                    &#9998;
                  </button>
                )}
              </p>
            )
          )}

          {error && <div style={{ color: "#a3312a", fontSize: 12.5, marginTop: 8 }}>{error}</div>}
        </div>
      </div>

      {isOwner && (
        <a href="/members/edit" className="btn btn-outline" style={{ flexShrink: 0 }}>
          Edit Profile
        </a>
      )}
    </div>
  );
}
