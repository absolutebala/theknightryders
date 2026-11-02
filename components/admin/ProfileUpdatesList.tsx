type Row = {
  member_id: string;
  full_name: string | null;
  handle: string | null;
  profile_photo_url: string | null;
  profile_updated_at: string;
};

export default function ProfileUpdatesList({ rows, pendingCount }: { rows: Row[]; pendingCount: number }) {
  return (
    <section style={{ marginTop: 50 }}>
      <h2 style={{ color: "var(--navy)", marginBottom: 4, fontSize: 20 }}>Profile Updates</h2>
      <p style={{ color: "var(--grey)", fontSize: 13.5, marginBottom: 16 }}>
        {rows.length} member{rows.length === 1 ? "" : "s"} updated · {pendingCount} still to update
      </p>
      {rows.length === 0 ? (
        <p style={{ color: "var(--grey)", fontStyle: "italic", fontSize: 14 }}>No one has completed the update yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((r) => (
            <a
              key={r.member_id}
              href={r.handle ? `/@${r.handle}` : `/members/${r.member_id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
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
              <div style={{ flex: 1, fontWeight: 700, fontSize: 14.5 }}>{r.full_name ?? "Unnamed member"}</div>
              <div style={{ fontSize: 12.5, color: "var(--grey)" }}>
                {new Date(r.profile_updated_at).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "Asia/Kolkata",
                })}
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
