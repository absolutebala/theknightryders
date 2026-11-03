"use client";

import { useState } from "react";
import UniversalRequestActions from "./UniversalRequestActions";

export type Registration = {
  registration_id: string;
  participant_id: string;
  ride_id: string;
  ride_title: string;
  ride_slug: string;
  ride_date: string;
  member_id: string;
  handle: string | null;
  full_name: string;
  phone: string;
  vehicle_number: string;
  upi_txn: string;
  gear: string[];
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
};

const BADGE = {
  pending: { bg: "#fff3d6", color: "#8a5a00" },
  approved: { bg: "#e6f4ea", color: "#1e6b3a" },
  rejected: { bg: "#fdeaea", color: "#a3312a" },
} as const;

export default function UpcomingRegistrationsList({ rows }: { rows: Registration[] }) {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const rides = new Map<string, { title: string; slug: string; date: string; items: Registration[] }>();
  for (const r of rows) {
    if (filter !== "all" && r.status !== filter) continue;
    if (!rides.has(r.ride_id)) rides.set(r.ride_id, { title: r.ride_title, slug: r.ride_slug, date: r.ride_date, items: [] });
    rides.get(r.ride_id)!.items.push(r);
  }
  const count = (s: string) => rows.filter((r) => r.status === s).length;

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 22, flexWrap: "wrap" }}>
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px",
              fontSize: 12.5,
              borderRadius: 16,
              border: "1px solid " + (filter === f ? "var(--navy)" : "#d8e0dc"),
              background: filter === f ? "var(--navy)" : "transparent",
              color: filter === f ? "#fff" : "var(--dark)",
              cursor: "pointer",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {f} {f === "all" ? `(${rows.length})` : `(${count(f)})`}
          </button>
        ))}
      </div>

      {rides.size === 0 && <p style={{ color: "var(--grey)", fontStyle: "italic" }}>Nothing here.</p>}

      {[...rides.entries()].map(([id, ride]) => (
        <section key={id} style={{ marginBottom: 34 }}>
          <h2 style={{ fontSize: 18, color: "var(--navy)", marginBottom: 12 }}>
            <a href={`/rides/upcoming/${ride.slug}`}>{ride.title}</a>{" "}
            <span style={{ fontSize: 13, color: "var(--grey)", fontWeight: 600 }}>
              &middot; {new Date(ride.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} &middot; {ride.items.length} request{ride.items.length === 1 ? "" : "s"}
            </span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ride.items.map((r) => (
              <div key={r.registration_id} style={{ background: "var(--white)", border: "1px solid #e3ebe7", borderRadius: 10, padding: "14px 16px", display: "flex", gap: 16, justifyContent: "space-between", flexWrap: "wrap" }}>
                <div style={{ minWidth: 240, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <a href={r.handle ? `/@${r.handle}` : `/members/${r.member_id}`} style={{ fontWeight: 800, color: "var(--navy)", fontSize: 15 }}>
                      {r.full_name}
                    </a>
                    <span style={{ background: BADGE[r.status].bg, color: BADGE[r.status].color, fontSize: 11.5, fontWeight: 700, padding: "2px 10px", borderRadius: 12, textTransform: "capitalize" }}>
                      {r.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 13.5, color: "var(--dark)", lineHeight: 1.7, marginTop: 6 }}>
                    Phone: <b>{r.phone}</b> &middot; Vehicle: <b>{r.vehicle_number}</b>
                    <br />
                    UPI txn: <b>{r.upi_txn}</b>
                    <br />
                    Gear: {r.gear.join(", ")}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--grey)", marginTop: 4 }}>
                    Submitted {new Date(r.submitted_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })}
                  </div>
                </div>
                <UniversalRequestActions
                  id={r.participant_id}
                  status={r.status}
                  approveFn="approve_upcoming_ride_participant"
                  rejectFn="reject_upcoming_ride_participant"
                  paramName="participant_id"
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
