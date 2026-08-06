import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google redirects here after the user approves sign-in.
// We exchange the auth code for a Supabase session, then send them to
// their own public profile (by handle if set, else /members/[id]) --
// or to /members if they're not a recognized member yet, which handles
// the pending-approval flow.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Link this Google account to a members row with the same email,
      // the first time they ever log in.
      await supabase.rpc("link_member_account");

      const { data: member } = await supabase
        .from("members")
        .select("id, handle, is_hidden")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (member && !member.is_hidden) {
        const dest = member.handle ? `/@${member.handle}` : `/members/${member.id}`;
        return NextResponse.redirect(`${origin}${dest}`);
      }

      // Not a recognized member yet, or their profile is hidden pending
      // reactivation -- /members handles both of those states.
      return NextResponse.redirect(`${origin}/members`);
    }
  }

  // Something went wrong (denied access, expired code, etc.)
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
