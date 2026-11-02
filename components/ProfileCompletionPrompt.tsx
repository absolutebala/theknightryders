"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LOGGED_KEY = "tkr_profile_prompt_logged";
const SNOOZE_KEY = "tkr_profile_prompt_snoozed";

/**
 * One-time popup shown to signed-in members who haven't yet completed the
 * mandatory profile update (photo, vehicle number, blood group, date of birth).
 * "Later" is remembered per sign-in (signInId changes on every login).
 * The server only renders this while members.profile_updated_at is empty, so
 * it disappears for good once the member saves a complete profile.
 */
export default function ProfileCompletionPrompt({ signInId }: { signInId: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let snoozed = false;
    try {
      snoozed = sessionStorage.getItem(SNOOZE_KEY) === signInId;
      setOpen(!snoozed);
      // Tell the admin page this member saw the popup (once per sign-in)
      if (!snoozed && sessionStorage.getItem(LOGGED_KEY) !== signInId) {
        sessionStorage.setItem(LOGGED_KEY, signInId);
        void createClient().rpc("log_profile_prompt", { p_action: "shown" });
      }
    } catch {
      setOpen(true);
    }
  }, [signInId]);

  if (!open || pathname.startsWith("/members/edit")) return null;

  function later() {
    try {
      sessionStorage.setItem(SNOOZE_KEY, signInId);
    } catch {}
    void createClient().rpc("log_profile_prompt", { p_action: "later" });
    setOpen(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-prompt-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(5,8,15,.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          maxWidth: 440,
          width: "100%",
          padding: "30px 28px",
          boxShadow: "0 20px 60px rgba(0,0,0,.4)",
          borderTop: "5px solid var(--amber)",
        }}
      >
        <h2 id="profile-prompt-title" style={{ color: "var(--navy)", margin: "0 0 10px", fontSize: 22 }}>
          Update your profile
        </h2>
        <p style={{ color: "var(--dark)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 12px" }}>
          Please take a minute to complete your Knight Ryders profile. This is a one-time update.
        </p>
        <ul style={{ margin: "0 0 22px", paddingLeft: 20, color: "var(--navy)", fontSize: 14.5, lineHeight: 1.8, fontWeight: 600 }}>
          <li>Profile picture</li>
          <li>Vehicle number</li>
          <li>Blood group</li>
          <li>Date of birth</li>
        </ul>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href="/members/edit" className="btn btn-amber" style={{ padding: "10px 22px", fontSize: 14 }}>
            Update Profile
          </a>
          <button
            type="button"
            onClick={later}
            style={{
              padding: "10px 18px",
              fontSize: 13.5,
              background: "transparent",
              border: "1px solid #c7d3cf",
              borderRadius: 4,
              cursor: "pointer",
              color: "var(--grey)",
            }}
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
