"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type RideResult = {
  id: string;
  title: string;
  destination: string | null;
  ride_date: string | null;
  total_km: number | null;
};

export default function AssignRidesButton({
  memberId,
  memberName,
}: {
  memberId: string;
  memberName: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RideResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const supabase = createClient();
      const q = query.trim();
      const { data } = await supabase
        .from("rides")
        .select("id, title, destination, ride_date, total_km")
        .or(`title.ilike.%${q}%,destination.ilike.%${q}%`)
        .order("ride_date", { ascending: false, nullsFirst: false })
        .limit(8);
      setResults(data ?? []);
      setSearching(false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  async function handleAssign(ride: RideResult) {
    setAssigning(ride.id);
    setMessage(null);
    const supabase = createClient();

    const { data: existing } = await supabase
      .from("ride_participants")
      .select("id")
      .eq("ride_id", ride.id)
      .eq("member_id", memberId)
      .maybeSingle();

    if (existing) {
      setAssigning(null);
      setMessage(`${memberName ?? "This member"} is already assigned to "${ride.title}".`);
      return;
    }

    const { error } = await supabase.from("ride_participants").insert({
      ride_id: ride.id,
      member_id: memberId,
      rider_name: memberName ?? "Knight Ryder",
      km_covered: ride.total_km ?? 0,
    });

    setAssigning(null);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(`Assigned to "${ride.title}".`);
    setQuery("");
    setResults([]);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-outline"
        style={{ padding: "8px 18px", fontSize: 12.5 }}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Close" : "Assign Rides"}
      </button>

      {open && (
        <div
          style={{
            marginTop: 12,
            background: "var(--white)",
            border: "1.5px solid var(--cta-blue)",
            borderRadius: 10,
            padding: 16,
            maxWidth: 420,
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rides by title or destination..."
            autoFocus
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "1.5px solid #c7d3cf",
              borderRadius: 6,
              fontSize: 14,
              marginBottom: message || results.length > 0 || searching ? 10 : 0,
            }}
          />

          {message && (
            <div style={{ fontSize: 12.5, color: "var(--cta-blue)", marginBottom: 10 }}>{message}</div>
          )}

          {searching && <div style={{ fontSize: 12.5, color: "var(--grey)" }}>Searching…</div>}

          {!searching && results.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {results.map((ride) => (
                <button
                  key={ride.id}
                  type="button"
                  disabled={assigning === ride.id}
                  onClick={() => handleAssign(ride)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    width: "100%",
                    padding: "9px 12px",
                    background: "var(--mint)",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span>
                    <span style={{ fontSize: 13.5, color: "var(--dark)", fontWeight: 600 }}>{ride.title}</span>
                    {ride.ride_date && (
                      <span style={{ fontSize: 11.5, color: "var(--grey)", marginLeft: 8 }}>
                        {new Date(ride.ride_date).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: 11.5, color: "var(--cta-blue)", fontWeight: 700, flexShrink: 0 }}>
                    {assigning === ride.id ? "Assigning…" : "Assign"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
