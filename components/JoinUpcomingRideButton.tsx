"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function JoinUpcomingRideButton({
  upcomingRideId,
  initialStatus,
}: {
  upcomingRideId: string;
  initialStatus: "pending" | "approved" | "rejected" | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("request_join_upcoming_ride", { target_upcoming_ride_id: upcomingRideId });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setStatus("pending");
    router.refresh();
  }

  if (status === "approved") {
    return <span className="btn btn-outline" style={{ opacity: 0.7, cursor: "default" }}>You&apos;re Going &#10003;</span>;
  }

  if (status === "pending") {
    return <span className="btn btn-outline" style={{ opacity: 0.6, cursor: "default" }}>Request Pending</span>;
  }

  return (
    <div>
      <button type="button" className="btn btn-amber" onClick={handleClick} disabled={loading}>
        {loading ? "…" : status === "rejected" ? "Request Again" : "Request to Join"}
      </button>
      {error && <div style={{ color: "#a3312a", fontSize: 12.5, marginTop: 6 }}>{error}</div>}
    </div>
  );
}
