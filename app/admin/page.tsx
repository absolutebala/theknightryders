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

  const [
    { data: pending },
    { data: recentlyReviewed },
    { data: templateRequests },
    { data: recentlyReviewedTemplates },
  ] = await Promise.all([
    supabase
      .from("pending_requests")
      .select("id, email, full_name, status, requested_at")
      .eq("status", "pending")
      .order("requested_at", { ascending: true }),
    supabase
      .from("pending_requests")
      .select("id, email, full_name, status, requested_at, reviewed_at, reviewed_by")
      .neq("status", "pending")
      .order("reviewed_at", { ascending: false })
      .limit(15),
    supabase
      .from("template_requests")
      .select("id, requested_at, member_id, members(full_name, handle)")
      .eq("status", "pending")
      .order("requested_at", { ascending: true }),
    supabase
      .from("template_requests")
      .select("id, requested_at, reviewed_at, reviewed_by, status, member_id, members(full_name, handle)")
      .neq("status", "pending")
      .order("reviewed_at", { ascending: false })
      .limit(15),
  ]);

  return (
    <div className="container" style={{ padding: "70px 24px", maxWidth: 860 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ color: "var(--navy)", marginBottom: 6 }}>Pending Access Requests</h1>
          <p style={{ color: "var(--grey)", marginBottom: 30 }}>
            {pending?.length ?? 0} request{pending?.length === 1 ? "" : "s"} waiting for review.
          </p>
        </div>
        <a
          href="/?openHolidays=1#holiday-cards"
          className="btn btn-outline"
          style={{ padding: "8px 18px", fontSize: 12.5, flexShrink: 0 }}
        >
          Manage Holiday Cards
        </a>
      </div>

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

      {templateRequests && templateRequests.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, color: "var(--navy)", marginBottom: 14 }}>
            Elite Template Requests
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 50 }}>
            {templateRequests.map((req) => {
              const memberInfo = (
                Array.isArray(req.members) ? req.members[0] : req.members
              ) as { full_name: string | null; handle: string | null } | null;

              return (
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
                    <a
                      href={memberInfo?.handle ? `/@${memberInfo.handle}` : `/members/${req.member_id}`}
                      target="_blank"
                      rel="noopener"
                      style={{ fontWeight: 700, color: "var(--navy)", textDecoration: "underline" }}
                    >
                      {memberInfo?.full_name || "(unnamed member)"}
                      {memberInfo?.handle && (
                        <span style={{ color: "var(--grey)", fontWeight: 500 }}> @{memberInfo.handle}</span>
                      )}
                    </a>
                    <div style={{ fontSize: 12, color: "var(--grey)", marginTop: 2 }}>
                      Requested {new Date(req.requested_at).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <ApprovalActions
                    requestId={req.id}
                    approveFn="approve_template_request"
                    rejectFn="reject_template_request"
                  />
                </div>
              );
            })}
          </div>
        </>
      )}

      {recentlyReviewedTemplates && recentlyReviewedTemplates.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, color: "var(--navy)", marginBottom: 14 }}>
            Recently Reviewed &mdash; Elite Requests
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 50 }}>
            {recentlyReviewedTemplates.map((req) => {
              const memberInfo = (
                Array.isArray(req.members) ? req.members[0] : req.members
              ) as { full_name: string | null; handle: string | null } | null;

              return (
                <div
                  key={req.id}
                  style={{
                    fontSize: 13.5,
                    color: "var(--grey)",
                    padding: "8px 0",
                    borderBottom: "1px solid #e4e4e4",
                  }}
                >
                  <a
                    href={memberInfo?.handle ? `/@${memberInfo.handle}` : `/members/${req.member_id}`}
                    target="_blank"
                    rel="noopener"
                    style={{ color: "var(--dark)", fontWeight: 700, textDecoration: "underline" }}
                  >
                    {memberInfo?.full_name || "(unnamed member)"}
                  </a>{" "}
                  &mdash;{" "}
                  <span
                    style={{
                      color: req.status === "approved" ? "#1e6b3a" : "#a3312a",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {req.status}
                  </span>{" "}
                  by {req.reviewed_by ?? "—"}
                  <br />
                  Requested {new Date(req.requested_at).toLocaleString("en-IN")}
                  {req.reviewed_at && (
                    <> &middot; Reviewed {new Date(req.reviewed_at).toLocaleString("en-IN")}</>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {recentlyReviewed && recentlyReviewed.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, color: "var(--navy)", marginBottom: 14 }}>
            Recently Reviewed &mdash; Member Access
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
                by {req.reviewed_by}
                <br />
                Requested {new Date(req.requested_at).toLocaleString("en-IN")}
                {req.reviewed_at && (
                  <> &middot; Reviewed {new Date(req.reviewed_at).toLocaleString("en-IN")}</>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
