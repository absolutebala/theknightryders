type Row = {
  member_id: string;
  full_name: string | null;
  handle: string | null;
  profile_photo_url: string | null;
  status: "shown" | "later" | "updated";
  last_activity_at: string;
};

const STATUS = {
  updated: { label: "Updated", bg: "#e6f4ea", color: "#1e6b3a" },
  later: { label: "Clicked Later", bg: "#fff3d6", color: "#8a5a00" },
  shown: { label: "Seen, no action", bg: "#eef1f5", color: "#4a5568" },
} as const;

export default function ProfileUpdatesList({ rows, pendingCount }: { rows: Row[]; pendingCount: number }) {
  const count = (s: Row["status"]) => rows.filter((r) => r.status === s).length;
  return (
    <section style={{ marginTop: 50 }}>
      <h2 style={{ color: "var(--navy)", marginBottom: 4, fontSize: 20 }}>Profile Updates</h2>
      <p style={{ color: "var(--grey)", fontSize: 13.5, marginBottom: 16 }}>
        {count("updated")} updated · {count("later")} clicked Later · {count("shown")} seen, no action ·{" "}
        {pendingCount} not yet logged in / updated
      </p>
      {rows.length === 0 ? (
        <p style={{ color: "var(--grey)", fontStyle: "italic", fontSize: 14 }}>No member activity yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((r) => {
            const st = STATUS[r.status];
            return (
              <a
                key={r.member_id}
                href={r.handle ? `/@${r.handle}` : `/members/${r.member_id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  background: "var(--white)",
                  border: "1px solid #e3ebe7",
                  borderRadius: 10,
                  padding: "10px 14px",
                  color: "var(--navy)",
                }}
              >
                {r.profile_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.profile_photo_url} alt="" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--mint)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                    {(r.full_name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, fontWeight: 700, fontSize: 14.5, minWidth: 120 }}>{r.full_name ?? "Unnamed member"}</div>
                <span style={{ background: st.bg, color: st.color, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12 }}>
                  {st.label}
                </span>
                <div style={{ fontSize: 12.5, color: "var(--grey)", minWidth: 130, textAlign: "right" }}>
                  {new Date(r.last_activity_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: "Asia/Kolkata",
                  })}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}
