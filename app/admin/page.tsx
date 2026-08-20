import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminRequestTabs from "@/components/admin/AdminRequestTabs";

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
        <p style={{ color: "var(--grey)" }}>This page is for club admins only.</p>
      </div>
    );
  }

  const [
    { data: pending },
    { data: recentlyReviewed },
    { data: templateRequests },
    { data: recentlyReviewedTemplates },
    { data: reactivationRequests },
    { data: pastRideRequestsRaw },
    { data: upcomingRideRequestsRaw },
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
      .limit(30),
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
      .limit(30),
    supabase
      .from("members")
      .select("id, full_name, reactivation_requested_at")
      .not("reactivation_requested_at", "is", null)
      .order("reactivation_requested_at", { ascending: true }),
    supabase.rpc("get_all_ride_join_requests"),
    supabase.rpc("get_all_upcoming_ride_requests"),
  ]);

  type TemplateRow = {
    id: string;
    requested_at: string;
    reviewed_at?: string | null;
    reviewed_by?: string | null;
    status?: string;
    member_id: string;
    members: { full_name: string | null; handle: string | null } | { full_name: string | null; handle: string | null }[] | null;
  };

  function flattenTemplate(req: TemplateRow) {
    const m = Array.isArray(req.members) ? req.members[0] : req.members;
    return {
      id: req.id,
      requested_at: req.requested_at,
      reviewed_at: req.reviewed_at,
      reviewed_by: req.reviewed_by,
      status: req.status,
      member_id: req.member_id,
      memberName: m?.full_name ?? null,
      memberHandle: m?.handle ?? null,
    };
  }

  type RideRequestRow = {
    id: string;
    ride_title: string;
    ride_slug: string;
    member_name: string | null;
    status: string;
    requested_at: string;
  };

  const pastRideRequests = ((pastRideRequestsRaw ?? []) as RideRequestRow[]).map((r) => ({
    id: r.id,
    ride_title: r.ride_title,
    ride_slug: r.ride_slug,
    member_name: r.member_name,
    status: r.status as "pending" | "approved" | "rejected",
    requested_at: r.requested_at,
  }));

  const upcomingRideRequests = ((upcomingRideRequestsRaw ?? []) as RideRequestRow[]).map((r) => ({
    id: r.id,
    ride_title: r.ride_title,
    ride_slug: r.ride_slug,
    member_name: r.member_name,
    status: r.status as "pending" | "approved" | "rejected",
    requested_at: r.requested_at,
  }));

  return (
    <div className="container" style={{ padding: "70px 24px", maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ color: "var(--navy)", marginBottom: 6 }}>Admin Requests</h1>
          <p style={{ color: "var(--grey)", marginBottom: 30 }}>Everything waiting on your review, organized by category.</p>
        </div>
        <a href="/?openHolidays=1#holiday-cards" className="btn btn-outline" style={{ padding: "8px 18px", fontSize: 12.5, flexShrink: 0 }}>
          Manage Holiday Cards
        </a>
      </div>

      <AdminRequestTabs
        accessPending={pending ?? []}
        accessReviewed={recentlyReviewed ?? []}
        templatePending={(templateRequests ?? []).map(flattenTemplate)}
        templateReviewed={(recentlyReviewedTemplates ?? []).map(flattenTemplate)}
        reactivationPending={reactivationRequests ?? []}
        pastRideRequests={pastRideRequests}
        upcomingRideRequests={upcomingRideRequests}
      />
    </div>
  );
}
