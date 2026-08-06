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

  async function handleRemove() {
    const confirmed = window.confirm(
      "Remove your profile from the Members directory, leaderboard, and Frequently Rides With? Your account and ride history stay intact -- but to come back afterward, you'll need to log in again and an admin will need to approve your return."
    );
    if (!confirmed) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("set_member_hidden", {
      target_member_id: memberId,
      hidden: true,
    });
    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }
    router.refresh();
  }

  if (isHidden) {
    // Self-restore isn't possible anymore -- log in again to trigger the
    // reactivation request, which an admin then approves. Shown mainly as
    // a defensive fallback since the normal flow redirects a hidden
    // member away from their own profile before they'd ever see this.
    return (
      <span style={{ fontSize: 12.5, color: dark ? "rgba(255,255,255,.55)" : "var(--grey)" }}>
        Profile removed -- log in again to request reactivation.
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
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
      {loading ? "…" : "Remove my profile"}
    </button>
  );
}
