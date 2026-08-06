"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ApproveReactivationButton({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const confirmed = window.confirm("Restore this member's profile? They'll show up again in the Members directory, leaderboard, and Frequently Rides With.");
    if (!confirmed) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("approve_reactivation", { target_member_id: memberId });
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
        background: "var(--cta-blue)",
        color: "#fff",
        border: "none",
        borderRadius: 14,
        padding: "5px 14px",
        fontSize: 11.5,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {loading ? "…" : "Approve & Restore"}
    </button>
  );
}
