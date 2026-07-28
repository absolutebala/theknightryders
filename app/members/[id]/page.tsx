import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileView from "@/components/profile/ProfileView";

// Public profile -- viewable by anyone, no login required.
// If this member has set a handle, canonicalize to /@handle so links
// created going forward use the friendly URL.
export default async function PublicMemberProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: member } = await supabase
    .from("members_public")
    .select("id, handle")
    .eq("id", id)
    .maybeSingle();

  if (!member) {
    notFound();
  }

  if (member.handle) {
    redirect(`/@${member.handle}`);
  }

  return <ProfileView memberId={id} />;
}
