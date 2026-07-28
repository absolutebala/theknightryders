import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MembersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Link this Google account to a members row with the same email,
  // the first time they ever log in. No-op if already linked, or if
  // there's no matching WordPress-imported member for this email.
  await supabase.rpc("link_member_account");

  const { data: member } = await supabase
    .from("members")
    .select(
      "id, full_name, bio, date_of_birth, join_date, gender, blood_group, why_joining, vehicle_number, address, profile_photo_url, social_links, ride_count, ride_list"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member) {
    return (
      <div className="container" style={{ padding: "70px 24px", maxWidth: 640 }}>
        <h1 style={{ color: "var(--navy)", marginBottom: 12 }}>
          We don&apos;t recognize this account
        </h1>
        <p style={{ color: "var(--grey)" }}>
          You&apos;re signed in as <strong>{user.email}</strong>, but this
          email isn&apos;t on our members list yet. If you&apos;re a Knight
          Ryders member, reach out on WhatsApp (+91 6381 890 182) and
          we&apos;ll get your profile linked up.
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "70px 24px", maxWidth: 760 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
        {member.profile_photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.profile_photo_url}
            alt={member.full_name ?? "Profile photo"}
            style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover" }}
          />
        )}
        <div>
          <h1 style={{ color: "var(--navy)" }}>
            Welcome back{member.full_name ? `, ${member.full_name}` : ""}!
          </h1>
          <p style={{ color: "var(--grey)", fontSize: 14 }}>{user.email}</p>
        </div>
      </div>

      <div
        style={{
          background: "var(--mint)",
          borderRadius: 14,
          padding: 24,
          marginBottom: 24,
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

      <p style={{ color: "var(--dark)", marginBottom: 20 }}>{member.bio || "No bio yet."}</p>

      <div style={{ display: "flex", gap: 14 }}>
        <a href={`/members/${member.id}`} className="btn btn-amber">
          View Public Profile
        </a>
        <a href="/members/edit" className="btn btn-outline">
          Edit My Profile
        </a>
      </div>

      <p style={{ marginTop: 30, fontSize: 13, color: "var(--grey)" }}>
        Ride history and ride count are maintained by club admins and can&apos;t
        be self-edited.
      </p>
    </div>
  );
}
