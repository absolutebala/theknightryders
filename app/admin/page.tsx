import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ApprovalActions from "./ApprovalActions";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");

  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: "70px 24px", maxWidth: 640 }}>
        <h1 style={{ color: "var(--navy)", marginBottom: 12 }}>Not authorized</h1>
        <p style={{ color: "var(--grey)" }}>
          This page is for club admins only.
        </p>
      </div>
    );
  }

  const { data: pending } = await supabase
    .from("pending_requests")
    .select("id, email, full_name, status, requested_at")
    .eq("status", "pending")
    .order("requested_at", { ascending: true });

  const { data: recentlyReviewed } = await supabase
    .from("pending_requests")
    .select("id, email, full_name, status, requested_at, reviewed_at, reviewed_by")
    .neq("status", "pending")
    .order("reviewed_at", { ascending: false })
    .limit(15);

  return (
    <div className="container" style={{ padding: "70px 24px", maxWidth: 860 }}>
      <h1 style={{ color: "var(--navy)", marginBottom: 6 }}>Pending Access Requests</h1>
      <p style={{ color: "var(--grey)", marginBottom: 30 }}>
        {pending?.length ?? 0} request{pending?.length === 1 ? "" : "s"} waiting for review.
      </p>

      {!pending || pending.length === 0 ? (
        <p style={{ color: "var(--grey)" }}>Nothing pending right now.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 50 }}>
          {pending.map((req) => (
            <div
              key={req.id}
              style={{
                background: "var(--mint)",
                borderRadius: 12,
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 14,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: "var(--navy)" }}>
                  {req.full_name || "(no name provided)"}
                </div>
                <div style={{ fontSize: 13.5, color: "var(--grey)" }}>{req.email}</div>
                <div style={{ fontSize: 12, color: "var(--grey)", marginTop: 2 }}>
                  Requested {new Date(req.requested_at).toLocaleString("en-IN")}
                </div>
              </div>
              <ApprovalActions requestId={req.id} />
            </div>
          ))}
        </div>
      )}

      {recentlyReviewed && recentlyReviewed.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, color: "var(--navy)", marginBottom: 14 }}>
            Recently Reviewed
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentlyReviewed.map((req) => (
              <div
                key={req.id}
                style={{
                  fontSize: 13.5,
                  color: "var(--grey)",
                  padding: "8px 0",
                  borderBottom: "1px solid #e4e4e4",
                }}
              >
                <strong style={{ color: "var(--dark)" }}>{req.email}</strong> —{" "}
                <span
                  style={{
                    color: req.status === "approved" ? "#1e6b3a" : "#a3312a",
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {req.status}
                </span>{" "}
                by {req.reviewed_by} on{" "}
                {req.reviewed_at ? new Date(req.reviewed_at).toLocaleDateString("en-IN") : ""}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
