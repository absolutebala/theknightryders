import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const SITE_URL = "https://theknightryders.com";
const SITE_TITLE = "The Knight Ryders | Group Bike Riding Community in Chennai";
const SITE_DESCRIPTION =
  "The Knight Ryders is a group bike riding community in Chennai for Honda CB350 owners. Join our weekend rides, long-distance tours and social-cause rides across Tamil Nadu and beyond.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: "%s | The Knight Ryders" },
  description: SITE_DESCRIPTION,
  keywords: [
    "group bike riding community",
    "group bike riding community Chennai",
    "Chennai bike riding community",
    "bike riding club Chennai",
    "Honda CB350 riding club",
    "motorcycle riding group Chennai",
    "weekend bike rides Chennai",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "The Knight Ryders",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_IN",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "The Knight Ryders logo" }],
  },
  twitter: { card: "summary", title: SITE_TITLE, description: SITE_DESCRIPTION, images: ["/icon.png"] },
};

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SportsOrganization",
      "@id": `${SITE_URL}/#organization`,
      name: "The Knight Ryders",
      alternateName: "Knight Ryders Honda CB350 Riding Club",
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
      description: SITE_DESCRIPTION,
      sport: "Motorcycle touring",
      areaServed: { "@type": "City", name: "Chennai" },
      location: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "Chennai", addressRegion: "Tamil Nadu", addressCountry: "IN" } },
      sameAs: [
        "https://www.instagram.com/theknightryders/",
        "https://www.facebook.com/theknightryders",
        "https://www.youtube.com/@TheKnightRyders1",
      ],
      contactPoint: { "@type": "ContactPoint", telephone: "+91-6381890182", contactType: "customer support", availableLanguage: ["en", "ta"] },
    },
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: "The Knight Ryders", publisher: { "@id": `${SITE_URL}/#organization` }, inLanguage: "en-IN" },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-V0KQP6J8SN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-V0KQP6J8SN');
          `}
        </Script>
        <Header authUser={headerUser} initialEditMode={initialEditMode} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
