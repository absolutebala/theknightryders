"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#d4af37";

type Props = {
  viewerMemberId: string | null;
  viewerHasElite: boolean;
  viewerRequestPending: boolean;
};

export default function RequestEliteBanner({
  viewerMemberId,
  viewerHasElite,
  viewerRequestPending,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(viewerRequestPending);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Not logged in as a recognized member, or already elite -- nothing to show.
  if (!viewerMemberId || viewerHasElite) return null;

  async function handleRequest() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("template_requests").insert({
      member_id: viewerMemberId,
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
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 150,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: `linear-gradient(135deg, ${GOLD}, #8a6d1c)`,
          color: "#000",
          border: "none",
          borderRadius: 30,
          padding: "12px 22px",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: ".02em",
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(212,175,55,.4)",
        }}
      >
        <span style={{ fontSize: 15 }}>&#128081;</span> Request for this Template
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(4,5,8,.85)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 420,
              maxWidth: "100%",
              background: "linear-gradient(160deg, #14161f, #0a0c10)",
              border: `1.5px solid ${GOLD}`,
              borderRadius: 18,
              padding: "32px 30px",
              boxShadow: "0 20px 50px rgba(0,0,0,.6), 0 0 40px rgba(212,175,55,.15)",
              position: "relative",
            }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "rgba(255,255,255,.08)",
                border: "1px solid rgba(255,255,255,.2)",
                color: "#fff",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              &#10005;
            </button>

            <div style={{ fontSize: 30, marginBottom: 10 }}>&#128081;</div>
            <h2
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 22,
                fontWeight: 700,
                color: GOLD,
                marginBottom: 18,
              }}
            >
              Go Elite
            </h2>

            <ul style={{ listStyle: "none", padding: 0, marginBottom: 26 }}>
              {[
                "Get your own handle -- @yourname",
                "A unique profile URL: theknightryders.com/@yourname",
                "This exact exclusive Elite profile design",
                "A gold crown badge next to your name on the Riders page",
              ].map((perk) => (
                <li
                  key={perk}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 12,
                    color: "#e2e5ea",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ color: GOLD, marginTop: 1 }}>&#10003;</span>
                  {perk}
                </li>
              ))}
            </ul>

            {error && (
              <div style={{ color: "#e08a7d", fontSize: 12.5, marginBottom: 14 }}>{error}</div>
            )}

            {submitted ? (
              <div
                style={{
                  background: "rgba(212,175,55,.12)",
                  border: `1px solid ${GOLD}`,
                  color: GOLD,
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "10px 16px",
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                Request sent -- an admin will review it soon.
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRequest}
                disabled={loading}
                style={{
                  width: "100%",
                  background: `linear-gradient(135deg, ${GOLD}, #8a6d1c)`,
                  color: "#000",
                  border: "none",
                  borderRadius: 24,
                  padding: "12px 20px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {loading ? "Sending…" : "Request Elite Access"}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
