import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import JoinUpcomingRideButton from "@/components/JoinUpcomingRideButton";
import UpcomingRideParticipantsManager from "@/components/admin/UpcomingRideParticipantsManager";
import UpcomingRidePhotoEditor from "@/components/admin/UpcomingRidePhotoEditor";

export default async function UpcomingRideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: ride } = await supabase
    .from("upcoming_rides")
    .select("id, slug, title, place, ride_date, end_date, is_multi_day, cost_per_person, summary, hero_image_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!ride) notFound();

  const cookieStore = await cookies();
  const editModeOn = cookieStore.get("edit_mode")?.value === "true";

  const [authResult, isAdminResult, participantsResult, pastPhotosResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("is_admin"),
    supabase
      .from("upcoming_ride_participants")
      .select("id, member_id, status, members_public(full_name, profile_photo_url)")
      .eq("upcoming_ride_id", ride.id),
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

  const { data: viewerMember } = user
    ? await supabase.from("members").select("id").eq("user_id", user.id).maybeSingle()
    : { data: null };

  type RawParticipant = {
    id: string;
    member_id: string;
    status: string;
    members_public: { full_name: string | null; profile_photo_url: string | null } | null;
  };
  const rawParticipants = (participantsResult.data ?? []) as unknown as RawParticipant[];

  const participants = rawParticipants.map((p) => ({
    id: p.id,
    member_id: p.member_id,
    status: p.status,
    full_name: p.members_public?.full_name ?? null,
    profile_photo_url: p.members_public?.profile_photo_url ?? null,
  }));

  const approved = participants.filter((p) => p.status === "approved");
  const pending = participants.filter((p) => p.status === "pending");
  const viewerParticipant = viewerMember ? participants.find((p) => p.member_id === viewerMember.id) : null;

  const existingPhotos = (pastPhotosResult.data ?? []).map((r) => ({ url: r.hero_image_url as string, title: r.title }));

  const dateLabel =
    ride.is_multi_day && ride.end_date
      ? `${new Date(ride.ride_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} - ${new Date(ride.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
      : new Date(ride.ride_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <>
      <div style={{ position: "relative", height: 420, background: "var(--navy)" }}>
        {ride.hero_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ride.hero_image_url}
            alt={ride.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(3,12,73,.2), rgba(3,12,73,.85))",
          }}
        />
        <div className="container" style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 32 }}>
          {isAdmin && <UpcomingRidePhotoEditor upcomingRideId={ride.id} existingPhotos={existingPhotos} currentUrl={ride.hero_image_url} />}
          <h1 style={{ color: "#fff", fontSize: 34, fontWeight: 800, marginBottom: 6 }}>{ride.title}</h1>
          <div style={{ color: "#e8ecf5", fontSize: 15 }}>
            {ride.place && <span>{ride.place} &middot; </span>}
            {dateLabel}
          </div>
        </div>
      </div>

      <section style={{ paddingTop: 40, paddingBottom: 20 }}>
        <div className="container" style={{ maxWidth: 780 }}>
          <div style={{ display: "flex", gap: 30, flexWrap: "wrap", marginBottom: 30 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--grey)", textTransform: "uppercase", marginBottom: 4 }}>Date</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>{dateLabel}</div>
            </div>
            {ride.place && (
              <div>
                <div style={{ fontSize: 12, color: "var(--grey)", textTransform: "uppercase", marginBottom: 4 }}>Place</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>{ride.place}</div>
              </div>
            )}
            {ride.cost_per_person !== null && (
              <div>
                <div style={{ fontSize: 12, color: "var(--grey)", textTransform: "uppercase", marginBottom: 4 }}>Cost Per Person</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>&#8377;{ride.cost_per_person}</div>
              </div>
            )}
          </div>

          {ride.summary && (
            <p style={{ color: "var(--dark)", fontSize: 15, lineHeight: 1.7, marginBottom: 10, whiteSpace: "pre-wrap" }}>
              {ride.summary}
            </p>
          )}

          {viewerMember && !viewerParticipant && (
            <div style={{ marginTop: 20 }}>
              <JoinUpcomingRideButton upcomingRideId={ride.id} initialStatus={null} />
            </div>
          )}
          {viewerParticipant && (viewerParticipant.status === "pending" || viewerParticipant.status === "approved") && (
            <div style={{ marginTop: 20 }}>
              <JoinUpcomingRideButton
                upcomingRideId={ride.id}
                initialStatus={viewerParticipant.status as "pending" | "approved"}
              />
            </div>
          )}
        </div>
      </section>

      <section style={{ paddingTop: 0, paddingBottom: 60 }}>
        <div className="container" style={{ maxWidth: 780 }}>
          <div style={{ background: "var(--mint)", borderRadius: 14, padding: 24 }}>
            <UpcomingRideParticipantsManager
              upcomingRideId={ride.id}
              approved={approved}
              pending={pending}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </section>
    </>
  );
}
