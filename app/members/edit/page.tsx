import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditProfileForm from "./EditProfileForm";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: member } = await supabase
    .from("members")
    .select(
      "id, full_name, bio, date_of_birth, gender, blood_group, why_joining, vehicle_number, address, profile_photo_url, social_links"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member) {
    redirect("/members");
  }

  return (
    <div className="container" style={{ padding: "70px 24px", maxWidth: 640 }}>
      <h1 style={{ color: "var(--navy)", marginBottom: 6 }}>Edit Profile</h1>
      <p style={{ color: "var(--grey)", marginBottom: 30 }}>
        Ride count and ride history aren&apos;t editable here -- they&apos;re
        maintained by club admins.
      </p>
      <EditProfileForm member={member} />
    </div>
  );
}
