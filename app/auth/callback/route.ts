import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google redirects here after the user approves sign-in.
// We exchange the auth code for a Supabase session, then send them
// on to the members area (or wherever they were headed).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/members";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong (denied access, expired code, etc.)
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
