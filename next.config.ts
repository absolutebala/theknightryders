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
    return oldUrlRedirects.map((r) => ({ ...r, permanent: true }));
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
