"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RemoveMyProfileButton({
  memberId,
  isHidden,
  dark = false,
}: {
  memberId: string;
  isHidden: boolean;
  dark?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const confirmed = window.confirm(
      isHidden
        ? "Restore your profile? You'll show up again in the Members directory, leaderboard, and Frequently Rides With."
        : "Remove your profile from the Members directory, leaderboard, and Frequently Rides With? Your account and ride history stay intact -- you can restore it anytime from here."
    );
    if (!confirmed) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("set_member_hidden", {
      target_member_id: memberId,
      hidden: !isHidden,
    });
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
        background: "none",
        border: "none",
        padding: 0,
        fontSize: 12.5,
        color: dark ? "rgba(255,255,255,.55)" : "var(--grey)",
        textDecoration: "underline",
        cursor: "pointer",
      }}
    >
      {loading ? "…" : isHidden ? "Restore my profile" : "Remove my profile"}
    </button>
  );
}
