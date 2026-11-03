import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import CreateUpcomingRideButton from "@/components/admin/CreateUpcomingRideButton";
import UpcomingPosterCard from "@/components/UpcomingPosterCard";
import JoinUpcomingRideButton from "@/components/JoinUpcomingRideButton";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upcoming Group Bike Rides from Chennai",
  description:
    "Upcoming group bike rides and tours from The Knight Ryders, a group bike riding community in Chennai. See dates, destinations and join the next ride.",
  alternates: { canonical: "/rides/upcoming" },
};

export default async function UpcomingRidesPage() {
  const supabase = await createClient();
  await supabase.rpc("convert_ended_upcoming_rides");
  const cookieStore = await cookies();
  const editModeOn = cookieStore.get("edit_mode")?.value === "true";

  const [authResult, isAdminResult, ridesResult, countsResult, pastPhotosResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("is_admin"),
    supabase
      .from("upcoming_rides")
      .select("id, slug, title, place, ride_date, end_date, is_multi_day, hero_image_url, cost_per_person")
      .order("ride_date", { ascending: true }),
    supabase.rpc("get_upcoming_ride_participant_counts"),
    supabase
      .from("rides")
      .select("title, hero_image_url")
      .not("hero_image_url", "is", null)
      .order("ride_date", { ascending: false })
      .limit(16),
  ]);

  const {
    data: { user },
  } = authResult;
  const isAdmin = !!user && !!isAdminResult.data && editModeOn;
  const rides = ridesResult.data ?? [];

  const { data: viewerMember } = user
    ? await supabase.from("members").select("id").eq("user_id", user.id).maybeSingle()
    : { data: null };
  const { data: myParticipation } = viewerMember
    ? await supabase.from("upcoming_ride_participants").select("upcoming_ride_id, status").eq("member_id", viewerMember.id)
    : { data: [] };
  const myStatusByRide = new Map(
    (myParticipation ?? []).map((p: { upcoming_ride_id: string; status: string }) => [p.upcoming_ride_id, p.status])
  );
  const { data: upiRows } = await supabase.from("upcoming_rides").select("id, upi_id");
  const upiById = new Map((upiRows ?? []).map((r: { id: string; upi_id: string | null }) => [r.id, r.upi_id]));

  // Poster details; separate query so the page works before the columns exist.
  const { data: extrasRows } = await supabase
    .from("upcoming_rides")
    .select("id, approx_km, approx_hours, slots_total");
  const extrasById = new Map(
    (extrasRows ?? []).map((r: { id: string; approx_km: string | null; approx_hours: string | null; slots_total: number | null }) => [r.id, r])
  );
  const countByRide = new Map<string, number>(
    (countsResult.data ?? []).map((c: { upcoming_ride_id: string; approved_count: number }) => [c.upcoming_ride_id, c.approved_count])
  );
  const existingPhotos = (pastPhotosResult.data ?? []).map((r) => ({ url: r.hero_image_url as string, title: r.title }));

  return (
    <section style={{ paddingTop: 60, paddingBottom: 100 }}>
      <div className="container" style={{ textAlign: "center" }}>
        <h1 className="sr-only">Upcoming Group Bike Rides from Chennai</h1>
        {isAdmin && (
          <div style={{ marginTop: 18 }}>
            <CreateUpcomingRideButton existingPhotos={existingPhotos} />
          </div>
        )}
      </div>

      <div className="container" style={{ marginTop: 20 }}>
        {rides.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--grey)" }}>
            No upcoming rides scheduled for now. Check back soon, or watch the club&apos;s channels for the next announcement.
          </p>
        ) : (
          <div className="upcoming-poster-grid">
            {rides.map((ride) => {
              const ex = extrasById.get(ride.id);
              return (
                <div key={ride.id} style={{ width: "100%", maxWidth: 320, textAlign: "center" }}>
                <UpcomingPosterCard
                  href={`/rides/upcoming/${ride.slug}`}
                  title={ride.title}
                  imageUrl={ride.hero_image_url}
                  rideDate={ride.ride_date}
                  endDate={ride.is_multi_day ? ride.end_date : null}
                  approxKm={ex?.approx_km ?? null}
                  approxHours={ex?.approx_hours ?? null}
                  slotsAvailable={
                    ex?.slots_total != null ? Math.max(0, ex.slots_total - (countByRide.get(ride.id) ?? 0)) : null
                  }
                  cost={ride.cost_per_person}
                />
                <div style={{ marginTop: 14 }}>
                  {viewerMember ? (
                    <JoinUpcomingRideButton
                      upcomingRideId={ride.id}
                      initialStatus={(myStatusByRide.get(ride.id) as "pending" | "approved" | "rejected" | undefined) ?? null}
                      rideTitle={ride.title}
                      cost={ride.cost_per_person}
                      upiId={upiById.get(ride.id) ?? null}
                    />
                  ) : (
                    <a href="/login" className="btn btn-amber">Log in to Request to Join</a>
                  )}
                </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
