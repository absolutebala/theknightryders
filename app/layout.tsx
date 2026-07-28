import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let headerUser: {
    name: string;
    avatarUrl: string | null;
    profileHref: string;
  } | null = null;

  if (user) {
    const { data: member } = await supabase
      .from("members")
      .select("full_name, handle, profile_photo_url")
      .eq("user_id", user.id)
      .maybeSingle();

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
    };
  }

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
          href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700,800|Montserrat:600,700,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header authUser={headerUser} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
