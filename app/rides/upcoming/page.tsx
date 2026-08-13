import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import CreateUpcomingRideButton from "@/components/admin/CreateUpcomingRideButton";

export default async function UpcomingRidesPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const editModeOn = cookieStore.get("edit_mode")?.value === "true";

  const [authResult, isAdminResult, ridesResult, countsResult, pastPhotosResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("is_admin"),
    supabase
      .from("upcoming_rides")
      .select("id, slug, title, place, ride_date, end_date, is_multi_day, hero_image_url")
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
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640, margin: "0 auto" }}>
            {rides.map((ride) => {
              const dateLabel = ride.is_multi_day && ride.end_date
                ? `${new Date(ride.ride_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - ${new Date(ride.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                : new Date(ride.ride_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

              return (
                <a
                  key={ride.id}
                  href={`/rides/upcoming/${ride.slug}`}
                  className="upcoming-ride-card"
                >
                  {ride.hero_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ride.hero_image_url} alt={ride.title} className="upcoming-ride-card-img" />
                  ) : (
                    <div className="upcoming-ride-card-img upcoming-ride-card-noimg">
                      {ride.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="upcoming-ride-card-body">
                    <div className="upcoming-ride-card-title">{ride.title}</div>
                    {ride.place && <div className="upcoming-ride-card-place">{ride.place}</div>}
                    <div className="upcoming-ride-card-meta">
                      <span>{dateLabel}</span>
                      <span>&middot;</span>
                      <span>{countByRide.get(ride.id) ?? 0} riders going</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
