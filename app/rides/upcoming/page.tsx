import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import CreateUpcomingRideButton from "@/components/admin/CreateUpcomingRideButton";
import UpcomingPosterCard from "@/components/UpcomingPosterCard";

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
    <section style={{ paddingTop: 90, paddingBottom: 100 }}>
      <div className="container" style={{ textAlign: "center" }}>
        <span className="eyebrow-sm">What's Next</span>
        <h1 className="section-title">Upcoming Rides</h1>
        <p className="section-sub" style={{ maxWidth: 480, margin: "16px auto 0" }}>
          Everything on the club's calendar -- join up before the kickstands go up.
        </p>
        {isAdmin && (
          <div style={{ marginTop: 18 }}>
            <CreateUpcomingRideButton existingPhotos={existingPhotos} />
          </div>
        )}
      </div>

      <div className="container" style={{ marginTop: 40 }}>
        {rides.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--grey)" }}>
            No upcoming rides scheduled for now. Check back soon, or watch the club&apos;s channels for the next announcement.
          </p>
        ) : (
          <div className="upcoming-poster-grid">
            {rides.map((ride) => {
              const ex = extrasById.get(ride.id);
              return (
                <UpcomingPosterCard
                  key={ride.id}
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
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
