"use client";

import { useState } from "react";

/** Copies the shareable "open the join popup" link for a ride. */
export default function CopyJoinLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/rides/upcoming/${slug}?join=1`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      style={{ background: "transparent", border: "1px solid var(--navy)", color: "var(--navy)", borderRadius: 6, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
    >
      {copied ? "Link copied ✓" : "Copy join link"}
    </button>
  );
}
