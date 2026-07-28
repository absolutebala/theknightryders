import type { NextConfig } from "next";

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
