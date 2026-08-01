"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CrownBadge from "@/components/CrownBadge";

type Member = {
  id: string;
  full_name: string | null;
  handle: string | null;
  profile_photo_url: string | null;
  profile_template: string | null;
};

type Participant = {
  id: string;
  member_id: string | null;
  rider_name: string;
  member: Member | null;
};

type SearchResult = {
  id: string;
  full_name: string | null;
  handle: string | null;
  profile_photo_url: string | null;
};

export default function RideParticipantsEditor({
  rideId,
  participants,
  isAdmin,
  sharedKm,
}: {
  rideId: string;
  participants: Participant[];
  isAdmin: boolean;
  sharedKm: number;
}) {
  const router = useRouter();
  const [managing, setManaging] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addedMemberIds = new Set(participants.map((p) => p.member_id).filter(Boolean));

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
        .select("id, full_name, handle, profile_photo_url")
        .ilike("full_name", `%${query.trim()}%`)
        .limit(8);
      setResults((data ?? []).filter((m) => !addedMemberIds.has(m.id)));
      setSearching(false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function handleAddMember(member: SearchResult) {
    setAdding(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("ride_participants").insert({
      ride_id: rideId,
      member_id: member.id,
      rider_name: member.full_name ?? "Knight Ryder",
      km_covered: sharedKm,
    });
    setAdding(false);
    if (error) {
      setError(error.message);
      return;
    }
    setQuery("");
    setResults([]);
    router.refresh();
  }

  async function handleAddGuest() {
    const name = query.trim();
    if (!name) return;
    setAdding(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("ride_participants").insert({
      ride_id: rideId,
      member_id: null,
      rider_name: name,
      km_covered: sharedKm,
    });
    setAdding(false);
    if (error) {
      setError(error.message);
      return;
    }
    setQuery("");
    setResults([]);
    router.refresh();
  }

  async function handleRemove(participantId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("ride_participants").delete().eq("id", participantId);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, color: "var(--navy)" }}>Riders on This Trip</h2>
        {isAdmin && (
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: "6px 16px", fontSize: 12.5 }}
            onClick={() => setManaging((m) => !m)}
          >
            {managing ? "Done" : "Manage"}
          </button>
        )}
      </div>

      {isAdmin && managing && (
        <div style={{ position: "relative", marginBottom: 20 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members by name to add..."
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1.5px solid var(--cta-blue)",
              borderRadius: 8,
              fontSize: 14,
            }}
          />
          {error && <div style={{ color: "#a3312a", fontSize: 12, marginTop: 6 }}>{error}</div>}

          {query.trim().length >= 2 && (
            <div
              style={{
                background: "var(--white)",
                border: "1px solid #d6dedb",
                borderRadius: 8,
                marginTop: 6,
                boxShadow: "0 6px 20px rgba(0,0,0,.1)",
                maxHeight: 260,
                overflowY: "auto",
              }}
            >
              {searching ? (
                <div style={{ padding: 14, fontSize: 13, color: "var(--grey)" }}>Searching…</div>
              ) : results.length > 0 ? (
                results.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    disabled={adding}
                    onClick={() => handleAddMember(m)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "10px 14px",
                      background: "none",
                      border: "none",
                      borderBottom: "1px solid #eef2f0",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {m.profile_photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.profile_photo_url}
                        alt=""
                        style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          background: "var(--mint)",
                          color: "var(--navy)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: 13,
                        }}
                      >
                        {(m.full_name ?? "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span style={{ fontSize: 14, color: "var(--dark)" }}>{m.full_name}</span>
                  </button>
                ))
              ) : (
                <button
                  type="button"
                  disabled={adding}
                  onClick={handleAddGuest}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px 14px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 13.5,
                    color: "var(--cta-blue)",
                  }}
                >
                  No member match -- add &ldquo;{query.trim()}&rdquo; as a guest rider
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {participants.length > 0 ? (
        <div className="ride-riders-grid">
          {participants.map((p) => {
            const member = p.member;
            const content = (
              <>
                <div style={{ position: "relative", display: "inline-block" }}>
                  {member?.profile_photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.profile_photo_url} alt="" className="ride-rider-avatar" />
                  ) : (
                    <div className="ride-rider-avatar ride-rider-avatar-noimg">
                      {(member?.full_name ?? p.rider_name).charAt(0).toUpperCase()}
                    </div>
                  )}
                  {member?.profile_template === "elite" && <CrownBadge size={18} />}
                  {isAdmin && managing && (
                    <button
                      type="button"
                      aria-label="Remove rider"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(p.id);
                      }}
                      style={{
                        position: "absolute",
                        bottom: -2,
                        right: -2,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: "none",
                        background: "#a3312a",
                        color: "#fff",
                        fontSize: 9,
                        cursor: "pointer",
                      }}
                    >
                      &#10005;
                    </button>
                  )}
                </div>
                <span className="ride-rider-name">{member?.full_name ?? p.rider_name}</span>
              </>
            );

            return member && !managing ? (
              <a
                key={p.id}
                href={member.handle ? `/@${member.handle}` : `/members/${member.id}`}
                className="ride-rider-card"
              >
                {content}
              </a>
            ) : (
              <div key={p.id} className="ride-rider-card ride-rider-card-guest">
                {content}
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ color: "var(--grey)", fontSize: 14 }}>Participant list not linked yet.</p>
      )}
    </div>
  );
}
