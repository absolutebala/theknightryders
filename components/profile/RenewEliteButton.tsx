"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#d4af37";

export default function RenewEliteButton({
  memberId,
  daysUntilExpiry,
  renewalPending,
}: {
  memberId: string;
  daysUntilExpiry: number | null;
  renewalPending: boolean;
}) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(renewalPending);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (daysUntilExpiry === null || daysUntilExpiry > 10 || daysUntilExpiry < 0) return null;

  async function handleRenew() {
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
    setSubmitted(true);
    router.refresh();
  }

  return (
    <div
      style={{
        background: "rgba(212,175,55,.1)",
        border: `1px solid ${GOLD}`,
        borderRadius: 12,
        padding: "14px 18px",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      <div style={{ fontSize: 13, color: "#f1e6c8" }}>
        Your Elite access {daysUntilExpiry === 0 ? "expires today" : `expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"}`}.
      </div>
      {submitted ? (
        <div style={{ color: GOLD, fontSize: 12.5, fontWeight: 700 }}>
          Renewal requested -- waiting on admin approval.
        </div>
      ) : (
        <button
          type="button"
          onClick={handleRenew}
          disabled={loading}
          style={{
            background: `linear-gradient(135deg, ${GOLD}, #8a6d1c)`,
            color: "#000",
            border: "none",
            borderRadius: 20,
            padding: "8px 20px",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {loading ? "Sending…" : "Renew Elite"}
        </button>
      )}
      {error && <div style={{ color: "#e08a7d", fontSize: 12, width: "100%" }}>{error}</div>}
    </div>
  );
}
