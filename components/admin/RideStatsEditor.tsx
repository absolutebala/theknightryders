"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RideStatsEditor({
  rideId,
  totalKm,
  riderCount,
  terrain,
  autoTerrain,
  state,
  isAdmin,
}: {
  rideId: string;
  totalKm: number | null;
  riderCount: number;
  terrain: string | null;
  autoTerrain: string;
  state: string | null;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [editingKm, setEditingKm] = useState(false);
  const [kmDraft, setKmDraft] = useState(totalKm?.toString() ?? "");
  const [editingTerrain, setEditingTerrain] = useState(false);
  const [terrainDraft, setTerrainDraft] = useState(terrain ?? "");
  const [editingState, setEditingState] = useState(false);
  const [stateDraft, setStateDraft] = useState(state ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveKm() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const value = kmDraft.trim() === "" ? 0 : Number(kmDraft);
    const { error } = await supabase.rpc("set_ride_km", { target_ride_id: rideId, km: value });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEditingKm(false);
    router.refresh();
  }

  async function saveTerrain() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("rides")
      .update({ terrain: terrainDraft.trim() || null })
      .eq("id", rideId);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEditingTerrain(false);
    router.refresh();
  }

  async function saveState() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("rides")
      .update({ state: stateDraft.trim() || null })
      .eq("id", rideId);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEditingState(false);
    router.refresh();
  }

  return (
    <div className="container ride-stats-row">
      <div className="ride-stat-card" style={{ position: "relative" }}>
        {editingKm ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
            <input
              type="number"
              value={kmDraft}
              onChange={(e) => setKmDraft(e.target.value)}
              autoFocus
              style={{ width: 100, padding: "6px 10px", border: "1.5px solid var(--cta-blue)", borderRadius: 6, textAlign: "center", fontSize: 16 }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" className="btn btn-amber" style={{ padding: "4px 12px", fontSize: 11 }} disabled={saving} onClick={saveKm}>
                {saving ? "…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setKmDraft(totalKm?.toString() ?? "");
                  setEditingKm(false);
                }}
                style={{ padding: "4px 12px", fontSize: 11, background: "transparent", border: "1px solid #c7d3cf", borderRadius: 4, cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="ride-stat-num">{totalKm && totalKm > 0 ? totalKm.toLocaleString("en-IN") : "—"}</div>
            <div className="ride-stat-label">Kilometers Covered</div>
          </>
        )}
        {isAdmin && !editingKm && (
          <button type="button" aria-label="Edit kilometers" onClick={() => setEditingKm(true)} style={editPencilStyle}>
            &#9998;
          </button>
        )}
      </div>

      <div className="ride-stat-card">
        <div className="ride-stat-num">{riderCount || "—"}</div>
        <div className="ride-stat-label">Riders</div>
      </div>

      <div className="ride-stat-card" style={{ position: "relative" }}>
        {editingTerrain ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              value={terrainDraft}
              onChange={(e) => setTerrainDraft(e.target.value)}
              placeholder="e.g. Hills, Coastal"
              autoFocus
              style={{ width: 140, padding: "6px 10px", border: "1.5px solid var(--cta-blue)", borderRadius: 6, textAlign: "center", fontSize: 14 }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" className="btn btn-amber" style={{ padding: "4px 12px", fontSize: 11 }} disabled={saving} onClick={saveTerrain}>
                {saving ? "…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTerrainDraft(terrain ?? "");
                  setEditingTerrain(false);
                }}
                style={{ padding: "4px 12px", fontSize: 11, background: "transparent", border: "1px solid #c7d3cf", borderRadius: 4, cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="ride-stat-num" style={{ fontSize: 28 }}>{terrain || autoTerrain}</div>
            <div className="ride-stat-label">Terrain</div>
          </>
        )}
        {isAdmin && !editingTerrain && (
          <button type="button" aria-label="Edit terrain" onClick={() => setEditingTerrain(true)} style={editPencilStyle}>
            &#9998;
          </button>
        )}
      </div>

      <div className="ride-stat-card" style={{ position: "relative" }}>
        {editingState ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              value={stateDraft}
              onChange={(e) => setStateDraft(e.target.value)}
              placeholder="e.g. Tamil Nadu"
              autoFocus
              style={{ width: 140, padding: "6px 10px", border: "1.5px solid var(--cta-blue)", borderRadius: 6, textAlign: "center", fontSize: 14 }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" className="btn btn-amber" style={{ padding: "4px 12px", fontSize: 11 }} disabled={saving} onClick={saveState}>
                {saving ? "…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStateDraft(state ?? "");
                  setEditingState(false);
                }}
                style={{ padding: "4px 12px", fontSize: 11, background: "transparent", border: "1px solid #c7d3cf", borderRadius: 4, cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="ride-stat-num" style={{ fontSize: 22 }}>{state || "—"}</div>
            <div className="ride-stat-label">State</div>
          </>
        )}
        {isAdmin && !editingState && (
          <button type="button" aria-label="Edit state" onClick={() => setEditingState(true)} style={editPencilStyle}>
            &#9998;
          </button>
        )}
      </div>

      {error && <div style={{ color: "#a3312a", fontSize: 12, width: "100%", textAlign: "center" }}>{error}</div>}
    </div>
  );
}

const editPencilStyle: React.CSSProperties = {
  position: "absolute",
  top: 8,
  right: 8,
  width: 22,
  height: 22,
  borderRadius: "50%",
  border: "1px solid var(--cta-blue)",
  background: "var(--white)",
  color: "var(--cta-blue)",
  fontSize: 10,
  cursor: "pointer",
};
