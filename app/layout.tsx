import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "The Knight Ryders | Exclusive Honda CB350 Riding Club",
  description:
    "The Knight Ryders — an exclusive bike riding club for Honda CB350 owners.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const [authResult, cookieStore] = await Promise.all([supabase.auth.getUser(), cookies()]);
  const {
    data: { user },
  } = authResult;

  let headerUser: {
    name: string;
    avatarUrl: string | null;
    profileHref: string;
    isAdmin: boolean;
    pendingRequestCount: number;
  } | null = null;

  if (user) {
    const [{ data: member }, { data: isAdminResult }] = await Promise.all([
      supabase
        .from("members")
        .select("full_name, handle, profile_photo_url")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.rpc("is_admin"),
    ]);

    let pendingRequestCount = 0;
    if (isAdminResult) {
      const [{ count: pendingAccessCount }, { count: pendingTemplateCount }] = await Promise.all([
        supabase
          .from("pending_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("template_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);
      pendingRequestCount = (pendingAccessCount ?? 0) + (pendingTemplateCount ?? 0);
    }

    headerUser = {
      name:
        member?.full_name ??
        user.user_metadata?.full_name ??
        user.email?.split("@")[0] ??
        "Rider",
      avatarUrl:
        member?.profile_photo_url ??
        user.user_metadata?.avatar_url ??
        user.user_metadata?.picture ??
        null,
      profileHref: member?.handle ? `/@${member.handle}` : "/members",
      isAdmin: !!isAdminResult,
      pendingRequestCount,
    };
  }

  const initialEditMode = cookieStore.get("edit_mode")?.value === "true";

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700,800|Montserrat:600,700,800|Oswald:500,600,700|Caveat:500,600,700|Inter:400,600,700|Poppins:500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header authUser={headerUser} initialEditMode={initialEditMode} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
