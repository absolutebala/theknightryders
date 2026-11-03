import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UpcomingRegistrationsList, { type Registration } from "@/components/admin/UpcomingRegistrationsList";

export default async function AdminUpcomingRidesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: "70px 24px", maxWidth: 640 }}>
        <h1 style={{ color: "var(--navy)", marginBottom: 12 }}>Not authorized</h1>
        <p style={{ color: "var(--grey)" }}>This page is for club admins only.</p>
      </div>
    );
  }

  const { data } = await supabase.rpc("get_upcoming_ride_registrations");

  return (
    <div className="container" style={{ padding: "70px 24px", maxWidth: 900 }}>
      <a href="/admin" style={{ fontSize: 13, color: "var(--cta-blue)", fontWeight: 700 }}>&larr; Admin</a>
      <h1 style={{ color: "var(--navy)", margin: "10px 0 6px" }}>Upcoming Ride Requests</h1>
      <p style={{ color: "var(--grey)", marginBottom: 30 }}>
        Join requests with payment and gear details, grouped by ride. Rejected riders can request again.
      </p>
      <UpcomingRegistrationsList rows={(data ?? []) as Registration[]} />
    </div>
  );
}
