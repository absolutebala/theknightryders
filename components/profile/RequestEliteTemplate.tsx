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
  const [open, setOpen] = useState(false);
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
    setOpen(false);
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
        onClick={() => setOpen(true)}
        className="btn btn-outline"
        style={{ padding: "8px 18px", fontSize: 12.5 }}
      >
        Request for Elite
      </button>
      {status === "rejected" && (
        <div style={{ color: "var(--grey)", fontSize: 12, marginTop: 6 }}>
          Your last request wasn&apos;t approved. You can request again above.
        </div>
      )}

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(23,37,42,.6)",
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
              background: "var(--white)",
              border: "1.5px solid var(--amber)",
              borderRadius: 18,
              padding: "32px 30px",
              boxShadow: "0 20px 50px rgba(0,0,0,.25)",
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
                background: "var(--mint)",
                border: "none",
                color: "var(--navy)",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              &#10005;
            </button>

            <div style={{ fontSize: 30, marginBottom: 10 }}>&#128081;</div>
            <h2
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 22,
                fontWeight: 800,
                color: "var(--navy)",
                marginBottom: 18,
              }}
            >
              Go Elite
            </h2>

            <ul style={{ listStyle: "none", padding: 0, marginBottom: 26 }}>
              {[
                "Get your own handle -- @yourname",
                "A unique profile URL: theknightryders.com/@yourname",
                "An exclusive Elite profile design",
                "A gold crown badge next to your name on the Riders page",
              ].map((perk) => (
                <li
                  key={perk}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 12,
                    color: "var(--dark)",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ color: "var(--amber)", marginTop: 1 }}>&#10003;</span>
                  {perk}
                </li>
              ))}
            </ul>

            {error && (
              <div style={{ color: "#a3312a", fontSize: 12.5, marginBottom: 14 }}>{error}</div>
            )}

            <button
              type="button"
              onClick={handleRequest}
              disabled={loading}
              className="btn btn-amber"
              style={{ width: "100%", padding: "12px 20px", fontSize: 14 }}
            >
              {loading ? "Sending…" : "Request Elite Access"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
