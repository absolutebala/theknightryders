"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RidePublishToggle({
  rideId,
  isPublished,
}: {
  rideId: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      isPublished
        ? "Unpublish this ride? It'll be hidden from the public Past Rides list, but nothing is deleted -- you can republish anytime."
        : "Republish this ride so it shows on the public Past Rides list again?"
    );
    if (!confirmed) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("rides")
      .update({ is_published: !isPublished })
      .eq("id", rideId);
    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 2,
        background: isPublished ? "#a3312a" : "var(--cta-blue)",
        color: "#fff",
        border: "none",
        borderRadius: 14,
        padding: "4px 10px",
        fontSize: 10.5,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {loading ? "…" : isPublished ? "Unpublish" : "Publish"}
    </button>
  );
}
