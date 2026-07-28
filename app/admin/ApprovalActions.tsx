"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ApprovalActions({
  requestId,
  approveFn = "approve_pending_request",
  rejectFn = "reject_pending_request",
}: {
  requestId: string;
  approveFn?: string;
  rejectFn?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(action: "approve" | "reject") {
    setLoading(action);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.rpc(action === "approve" ? approveFn : rejectFn, {
      request_id: requestId,
    });

    setLoading(null);

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {error && <div style={{ color: "#a3312a", fontSize: 12.5 }}>{error}</div>}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={() => handle("approve")}
          disabled={loading !== null}
          className="btn btn-amber"
          style={{ padding: "8px 18px", fontSize: 13 }}
        >
          {loading === "approve" ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          onClick={() => handle("reject")}
          disabled={loading !== null}
          className="btn btn-outline"
          style={{
            padding: "8px 18px",
            fontSize: 13,
            background: "transparent",
            color: "var(--navy)",
            border: "1.5px solid var(--navy)",
          }}
        >
          {loading === "reject" ? "Rejecting…" : "Reject"}
        </button>
      </div>
    </div>
  );
}
