"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UniversalRequestActions({
  id,
  status,
  approveFn,
  rejectFn,
  paramName = "request_id",
  confirmApprove,
}: {
  id: string;
  status: "pending" | "approved" | "rejected";
  approveFn: string;
  rejectFn?: string;
  paramName?: string;
  confirmApprove?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(action: "approve" | "reject") {
    if (action === "approve" && confirmApprove && !window.confirm(confirmApprove)) return;
    setLoading(action);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.rpc(action === "approve" ? approveFn : rejectFn!, {
      [paramName]: id,
    });

    setLoading(null);

    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
      {error && <div style={{ color: "#a3312a", fontSize: 11.5 }}>{error}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        {status !== "approved" && (
          <button
            type="button"
            onClick={() => handle("approve")}
            disabled={loading !== null}
            className="btn btn-amber"
            style={{ padding: "6px 14px", fontSize: 12 }}
          >
            {loading === "approve" ? "…" : "Approve"}
          </button>
        )}
        {status === "pending" && rejectFn && (
          <button
            type="button"
            onClick={() => handle("reject")}
            disabled={loading !== null}
            style={{
              padding: "6px 14px",
              fontSize: 12,
              background: "transparent",
              color: "var(--navy)",
              border: "1.5px solid var(--navy)",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {loading === "reject" ? "…" : "Reject"}
          </button>
        )}
      </div>
    </div>
  );
}
