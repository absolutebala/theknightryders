"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RiderRemoveButton({
  memberId,
  isHidden,
}: {
  memberId: string;
  isHidden: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      isHidden
        ? "Restore this member to the public Riders directory?"
        : "Remove this member from the public Riders directory? (Their account and ride history stay intact -- this just hides them from this page, and can be undone anytime.)"
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
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 2,
        background: isHidden ? "var(--cta-blue)" : "#a3312a",
        color: "#fff",
        border: "none",
        borderRadius: 14,
        padding: "4px 10px",
        fontSize: 10.5,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {loading ? "…" : isHidden ? "Restore" : "Remove"}
    </button>
  );
}
