import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Public profile -- viewable by anyone, no login required.
// Only pulls from members_public, which deliberately excludes private
// fields like address, phone/vehicle number, gender, blood group, etc.
export default async function PublicMemberProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: member } = await supabase
    .from("members_public")
    .select("id, full_name, bio, date_of_birth, join_date, profile_photo_url, ride_count, ride_list")
    .eq("id", id)
    .maybeSingle();

  if (!member) {
    notFound();
  }

  const rideList = Array.isArray(member.ride_list) ? member.ride_list : [];

  return (
    <div className="container" style={{ padding: "70px 24px", maxWidth: 760 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 30 }}>
        {member.profile_photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.profile_photo_url}
            alt={member.full_name ?? "Profile photo"}
            style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover" }}
          />
        )}
        <div>
          <h1 style={{ color: "var(--navy)" }}>{member.full_name ?? "Knight Ryder"}</h1>
          {member.date_of_birth && (
            <p style={{ color: "var(--grey)", fontSize: 14 }}>
              Born {new Date(member.date_of_birth).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      </div>

      <div
        style={{
          background: "var(--mint)",
          borderRadius: 14,
          padding: 24,
          marginBottom: 30,
          display: "flex",
          gap: 40,
        }}
      >
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--navy)" }}>
            {member.ride_count}
          </div>
          <div style={{ fontSize: 13, color: "var(--grey)", textTransform: "uppercase" }}>
            Rides Participated
          </div>
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--navy)" }}>
            {member.join_date
              ? new Date(member.join_date).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                })
              : "—"}
          </div>
          <div style={{ fontSize: 13, color: "var(--grey)", textTransform: "uppercase" }}>
            Member Since
          </div>
        </div>
      </div>

      {member.bio && (
        <>
          <h2 style={{ fontSize: 20, color: "var(--navy)", marginBottom: 10 }}>Bio</h2>
          <p style={{ color: "var(--dark)", marginBottom: 30 }}>{member.bio}</p>
        </>
      )}

      <h2 style={{ fontSize: 20, color: "var(--navy)", marginBottom: 10 }}>Rides</h2>
      {rideList.length === 0 ? (
        <p style={{ color: "var(--grey)" }}>No ride history linked yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {rideList.map((ride, i) => (
            <li
              key={i}
              style={{
                padding: "10px 0",
                borderBottom: "1px solid #e4e4e4",
                color: "var(--dark)",
              }}
            >
              {typeof ride === "string" ? ride : JSON.stringify(ride)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
