"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // The recovery link Supabase emails contains a token in the URL that
    // the client picks up automatically to establish a temporary session.
    // Give it a moment, then check whether we actually have one -- if not,
    // this page was opened directly rather than via a valid reset link.
    const supabase = createClient();
    const timer = setTimeout(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setReady(!!session);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Set New Password</h1>

        {done ? (
          <div style={{ background: "var(--mint)", borderRadius: 8, padding: "16px 18px", fontSize: 14.5, color: "var(--dark)" }}>
            Password updated. Redirecting you to login…
          </div>
        ) : !ready ? (
          <div style={{ color: "var(--grey)", fontSize: 14.5 }}>
            <p style={{ marginBottom: 12 }}>
              Verifying your reset link…
            </p>
            <p style={{ fontSize: 13 }}>
              If this doesn&apos;t load, the link may have expired --{" "}
              <a href="/forgot-password">request a new one</a>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}
            <div className="field">
              <label htmlFor="password">New Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-amber auth-submit" disabled={loading}>
              {loading ? "Saving…" : "Set New Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
