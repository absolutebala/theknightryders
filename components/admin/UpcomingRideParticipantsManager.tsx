"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Participant = {
  id: string;
  member_id: string;
  status: string;
  full_name: string | null;
  profile_photo_url: string | null;
};

type MemberSearchResult = {
  id: string;
  full_name: string | null;
  profile_photo_url: string | null;
};

export default function UpcomingRideParticipantsManager({
  upcomingRideId,
  approved,
  pending,
  isAdmin,
}: {
  upcomingRideId: string;
  approved: Participant[];
  pending: Participant[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MemberSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
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
      const { data } = await supabase
        .from("members_public")
        .select("id, full_name, profile_photo_url")
        .ilike("full_name", `%${query.trim()}%`)
        .limit(8);
      setResults(data ?? []);
      setSearching(false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  async function handleApprove(id: string) {
    setBusyId(id);
    const supabase = createClient();
    const { error } = await supabase.rpc("approve_upcoming_ride_participant", { participant_id: id });
    setBusyId(null);
    if (error) return alert(error.message);
    router.refresh();
  }

  async function handleReject(id: string) {
    setBusyId(id);
    const supabase = createClient();
    const { error } = await supabase.rpc("reject_upcoming_ride_participant", { participant_id: id });
    setBusyId(null);
    if (error) return alert(error.message);
    router.refresh();
  }

  async function handleRemove(id: string) {
    if (!window.confirm("Remove this rider from the participant list?")) return;
    setBusyId(id);
    const supabase = createClient();
    const { error } = await supabase.rpc("remove_upcoming_ride_participant", { participant_id: id });
    setBusyId(null);
    if (error) return alert(error.message);
    router.refresh();
  }

  async function handleManualAdd(memberId: string) {
    setBusyId(memberId);
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_add_upcoming_ride_participant", {
      target_upcoming_ride_id: upcomingRideId,
      target_member_id: memberId,
    });
    setBusyId(null);
    if (error) return alert(error.message);
    setQuery("");
    setResults([]);
    router.refresh();
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, color: "var(--navy)", marginBottom: 16 }}>
        Riders Participating <span style={{ fontWeight: 400, fontSize: 14, color: "var(--grey)" }}>({approved.length})</span>
      </h2>

      {approved.length === 0 ? (
        <p style={{ color: "var(--grey)", fontSize: 14 }}>No one&apos;s signed up yet -- be the first!</p>
      ) : (
        <div className="ride-riders-grid">
          {approved.map((p) => (
            <div key={p.id} className="ride-rider-card" style={{ position: "relative" }}>
              {p.profile_photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.profile_photo_url} alt="" className="ride-rider-avatar" />
              ) : (
                <div className="ride-rider-avatar ride-rider-avatar-noimg">
                  {(p.full_name ?? "?").charAt(0).toUpperCase()}
                </div>
              )}
              <span className="ride-rider-name">{p.full_name ?? "Knight Ryder"}</span>
              {isAdmin && (
                <button
                  type="button"
                  aria-label="Remove rider"
                  onClick={() => handleRemove(p.id)}
                  disabled={busyId === p.id}
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    border: "none",
                    background: "#a3312a",
                    color: "#fff",
                    fontSize: 10,
                    cursor: "pointer",
                  }}
                >
                  &#10005;
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <div style={{ marginTop: 30, borderTop: "1px solid #e3ebe7", paddingTop: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>
            Manage (admin only)
          </div>

          {pending.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12.5, color: "var(--grey)", marginBottom: 8 }}>Pending requests</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {pending.map((p) => (
                  <div
                    key={p.id}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", background: "var(--mint)", borderRadius: 6, fontSize: 13.5 }}
                  >
                    <span>{p.full_name ?? "Knight Ryder"}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => handleApprove(p.id)}
                        disabled={busyId === p.id}
                        style={{ background: "var(--cta-blue)", color: "#fff", border: "none", borderRadius: 12, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(p.id)}
                        disabled={busyId === p.id}
                        style={{ background: "transparent", border: "1px solid #c7d3cf", borderRadius: 12, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ fontSize: 12.5, color: "var(--grey)", marginBottom: 8 }}>Add a rider manually</div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members by name..."
            style={{ width: "100%", maxWidth: 320, padding: "8px 12px", border: "1.5px solid #c7d3cf", borderRadius: 6, fontSize: 13.5 }}
          />
          {searching && <div style={{ fontSize: 12, color: "var(--grey)", marginTop: 6 }}>Searching…</div>}
          {results.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8, maxWidth: 320 }}>
              {results.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleManualAdd(m.id)}
                  disabled={busyId === m.id}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", background: "var(--mint)", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13.5, textAlign: "left" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {m.profile_photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.profile_photo_url} alt="" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          background: "var(--navy)",
                          color: "var(--mint-text)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        {(m.full_name ?? "?").charAt(0).toUpperCase()}
                      </span>
                    )}
                    {m.full_name ?? "Knight Ryder"}
                  </span>
                  <span style={{ color: "var(--cta-blue)", fontSize: 11, fontWeight: 700 }}>
                    {busyId === m.id ? "…" : "Add"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
