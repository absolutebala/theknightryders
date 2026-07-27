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

  return (
    <div className="container" style={{ padding: "70px 24px" }}>
      <h1 style={{ color: "var(--navy)", marginBottom: 12 }}>
        Welcome back{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}!
      </h1>
      <p style={{ color: "var(--grey)" }}>
        This is the protected members&apos; area. Signed in as {user.email}.
      </p>
      {/* TODO: member directory, ride sign-ups, profile editing, etc. */}
    </div>
  );
}
