import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notifyAdminOfPendingRequest } from "@/lib/notifyAdmin";

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

  // Fill in a profile photo from their Google account if they don't already
  // have one set (e.g. from the WordPress import, or a manual edit).
  // Never overwrites an existing photo.
  if (member && !member.profile_photo_url) {
    const googleAvatar =
      user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null;

    if (googleAvatar) {
      await supabase
        .from("members")
        .update({ profile_photo_url: googleAvatar })
        .eq("id", member.id);
      member.profile_photo_url = googleAvatar;
    }
  }

  if (!member) {
    // Check for an existing pending request first, so we don't spam the
    // admin inbox on every page reload.
    const { data: existingRequest } = await supabase
      .from("pending_requests")
      .select("id, status")
      .eq("user_id", user.id)
      .order("requested_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!existingRequest) {
      const { error: insertError } = await supabase
        .from("pending_requests")
        .insert({
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name ?? null,
        });

      if (!insertError) {
        await notifyAdminOfPendingRequest({
          requesterEmail: user.email!,
          requesterName: user.user_metadata?.full_name ?? null,
        });
      }
    }

    const status = existingRequest?.status ?? "pending";

    return (
      <div className="container" style={{ padding: "70px 24px", maxWidth: 640 }}>
        <h1 style={{ color: "var(--navy)", marginBottom: 12 }}>
          {status === "rejected" ? "Access request declined" : "Request pending approval"}
        </h1>
        <p style={{ color: "var(--grey)" }}>
          You&apos;re signed in as <strong>{user.email}</strong>, but this
          email isn&apos;t on our members list yet.
          {status === "rejected" ? (
            <>
              {" "}Your access request was declined. If you think this is a
              mistake, reach out on WhatsApp (+91 6381 890 182).
            </>
          ) : (
            <>
              {" "}We&apos;ve let a club admin know -- once approved,
              refresh this page to see your profile. You can also reach out
              on WhatsApp (+91 6381 890 182) to speed things along.
            </>
          )}
        </p>
      </div>
    );
  }

  const { data: kmRow } = await supabase
    .from("ride_leaderboard")
    .select("total_km")
    .eq("member_id", member.id)
    .maybeSingle();
  const totalKm = kmRow?.total_km ?? 0;

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
          flexWrap: "wrap",
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
            {totalKm.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: 13, color: "var(--grey)", textTransform: "uppercase" }}>
            KMs Covered
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
