"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AddMeToRideButton({
  rideId,
  initialStatus,
}: {
  rideId: string;
  initialStatus: "pending" | "rejected" | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("request_join_ride", { target_ride_id: rideId });
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
      <span className="btn btn-outline" style={{ opacity: 0.6, cursor: "default" }}>
        Request Pending
      </span>
    );
  }

  return (
    <div>
      <button type="button" className="btn btn-outline" onClick={handleClick} disabled={loading}>
        {loading ? "…" : status === "rejected" ? "Request Again" : "Add me to this ride"}
      </button>
      {error && <div style={{ color: "#a3312a", fontSize: 12.5, marginTop: 6 }}>{error}</div>}
    </div>
  );
}
