import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileView from "@/components/profile/ProfileView";

// Reached via a rewrite: a request to /@somehandle is rewritten (in
// next.config.ts) to /profile/somehandle, landing here with just the
// handle (no @ prefix) already stripped. This avoids matching a literal
// "@" directly in the App Router's dynamic segment matching, which proved
// unreliable.
export default async function HandleProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const supabase = await createClient();

  const { data: memberId } = await supabase.rpc("get_member_id_by_handle", {
    lookup_handle: handle,
  });

  if (!memberId) {
    notFound();
  }

  return <ProfileView memberId={memberId} />;
}
