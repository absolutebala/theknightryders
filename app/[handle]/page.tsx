import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileView from "@/components/profile/ProfileView";

// Matches /@somehandle. Static routes (login, signup, admin, members,
// riders, rides) all take precedence over this at the same path level, so
// there's no conflict -- this only catches segments that don't match any
// other top-level route.
export default async function HandleProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  if (!handle.startsWith("@")) {
    notFound();
  }

  const cleanHandle = handle.slice(1);
  const supabase = await createClient();

  const { data: memberId } = await supabase.rpc("get_member_id_by_handle", {
    lookup_handle: cleanHandle,
  });

  if (!memberId) {
    notFound();
  }

  return <ProfileView memberId={memberId} />;
}
