"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    // Always show the same "sent" state regardless of whether the email
    // exists in the system -- this avoids leaking which emails are
    // registered members.
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Reset Password</h1>
        <p className="sub">
          Our website recently got migrated, so you may need to reset your
          password once if you signed up with an email and password.
        </p>

        {sent ? (
          <div style={{ background: "var(--mint)", borderRadius: 8, padding: "16px 18px", fontSize: 14.5, color: "var(--dark)" }}>
            If an account exists for <strong>{email}</strong>, a password
            reset link has been sent. Check your inbox (and spam folder) --
            it may take a minute to arrive.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-amber auth-submit" disabled={loading}>
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <a href="/login">Back to login</a>
        </div>
      </div>
    </div>
  );
}
