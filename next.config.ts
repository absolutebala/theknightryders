import type { NextConfig } from "next";

// Old WordPress URLs that Google still has indexed, mapped to their
// correct destination on the new site. Add more pairs here as they're
// found (e.g. via Search Console's 404 report) -- each becomes a
// permanent (301) redirect, which is the SEO-correct way to handle this
// rather than letting them hit the 404 page.
const oldUrlRedirects: { source: string; destination: string }[] = [
  {
    source: "/the-knight-ryders-ride-to-thally-hondacb350-group-bike-ride",
    destination: "/rides/ride-to-thalli-hosur",
  },
  {
    source: "/about-the-knight-ryders-club",
    destination: "/about",
  },
  {
    source: "/past-rides-theknightryders-honda-club",
    destination: "/rides/past",
  },
  {
    // Best guess -- the old site's generic "join a group ride" page has no
    // exact equivalent on the new site, so this points to the homepage.
    // Let me know if this should go somewhere more specific instead.
    source: "/group-ride-with-the-knight-ryders",
    destination: "/",
  },
  {
    source: "/kulu-kulu-ride-to-kotagiri-my-first-long-ride-with-the-knight-ryders",
    destination: "/rides/kulu-kulu-ride-to-kotagiri",
  },
  {
    source: "/canyon-drive-with-the-knight-ryders-29-31-october-2022",
    destination: "/rides/ride-to-great-canyon-gandikota",
  },
  {
    // Anniversary blog post, no direct equivalent on the new site --
    // pointing to the homepage. Let me know if there's a better target.
    source: "/celebrating-three-years-of-the-knight-ryders-club-a-journey-of-passion-and-adventure",
    destination: "/",
  },
  {
    // Old WordPress tag archive page -- redirecting to the closest
    // browsing equivalent.
    source: "/tag/honda-group-ride",
    destination: "/rides/past",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.theknightryders.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
  async redirects() {
    return [
      ...oldUrlRedirects.map((r) => ({ ...r, permanent: true })),
      {
        // The old site nested every individual ride post under this path,
        // and the migration preserved WordPress slugs verbatim for these
        // -- so this single rule covers every old ride URL at once,
        // including ones we haven't found in Search Console yet.
        source: "/past-rides-theknightryders-honda-club/:slug",
        destination: "/rides/:slug",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        // Public URL stays /@handle; internally served by
        // app/profile/[handle]/page.tsx. Using a rewrite (rather than a
        // literal "@"-prefixed dynamic route) avoids a routing mismatch
        // where the App Router's dynamic segment matching didn't reliably
        // handle a literal "@" as the first character of a path segment.
        source: "/@:handle",
        destination: "/profile/:handle",
      },
    ];
  },
};

export default nextConfig;
