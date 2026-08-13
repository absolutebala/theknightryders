"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RideJoinRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handle(action: "approve" | "reject") {
    setLoading(action);
    const supabase = createClient();
    const { error } = await supabase.rpc(
      action === "approve" ? "approve_ride_join_request" : "reject_ride_join_request",
      { request_id: requestId }
    );
    setLoading(null);
    if (error) {
      alert(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button
        type="button"
        onClick={() => handle("approve")}
        disabled={loading !== null}
        style={{ background: "var(--cta-blue)", color: "#fff", border: "none", borderRadius: 14, padding: "5px 14px", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
      >
        {loading === "approve" ? "…" : "Approve"}
      </button>
      <button
        type="button"
        onClick={() => handle("reject")}
        disabled={loading !== null}
        style={{ background: "transparent", color: "var(--grey)", border: "1px solid #c7d3cf", borderRadius: 14, padding: "5px 14px", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
      >
        {loading === "reject" ? "…" : "Reject"}
      </button>
    </div>
  );
}
