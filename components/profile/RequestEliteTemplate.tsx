"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  memberId: string;
  existingRequestStatus: "pending" | "approved" | "rejected" | null;
};

export default function RequestEliteTemplate({ memberId, existingRequestStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(existingRequestStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequest() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("template_requests").insert({
      member_id: memberId,
      requested_template: "elite",
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setStatus("pending");
    router.refresh();
  }

  if (status === "pending") {
    return (
      <div
        style={{
          display: "inline-block",
          background: "var(--mint)",
          color: "var(--navy)",
          fontSize: 12.5,
          fontWeight: 600,
          padding: "8px 16px",
          borderRadius: 6,
        }}
      >
        Elite template requested — waiting on admin approval
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleRequest}
        disabled={loading}
        className="btn btn-outline"
        style={{ padding: "8px 18px", fontSize: 12.5 }}
      >
        {loading ? "Requesting…" : "Request Elite Template"}
      </button>
      {error && <div style={{ color: "#a3312a", fontSize: 12, marginTop: 6 }}>{error}</div>}
      {status === "rejected" && (
        <div style={{ color: "var(--grey)", fontSize: 12, marginTop: 6 }}>
          Your last request wasn&apos;t approved. You can request again above.
        </div>
      )}
    </div>
  );
}
