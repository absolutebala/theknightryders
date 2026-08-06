"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authFailed = searchParams.get("error") === "auth_failed";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/members`,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // On success, the browser redirects to Google, so no further action here.
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    await supabase.rpc("link_member_account");

    if (data.user) {
      const { data: member } = await supabase
        .from("members")
        .select("id, handle, is_hidden")
        .eq("user_id", data.user.id)
        .maybeSingle();

      setLoading(false);

      if (member && !member.is_hidden) {
        router.push(member.handle ? `/@${member.handle}` : `/members/${member.id}`);
        router.refresh();
        return;
      }
    }

    setLoading(false);
    router.push("/members");
    router.refresh();
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Member Login</h1>
        <p className="sub">Sign in to access the members&apos; area.</p>

        {(error || authFailed) && (
          <div className="auth-error">
            {error ?? "Google sign-in didn't complete. Please try again."}
            {error === "Invalid login credentials" && (
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 400 }}>
                Our website recently got migrated, so you may need to reset
                your password once. <a href="/forgot-password">Reset password</a>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="btn auth-submit"
          style={{
            background: "#ffffff",
            color: "#3a4a4f",
            border: "1.5px solid #c7d3cf",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 22,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.96 10.71A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3-2.33z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"
            />
          </svg>
          {googleLoading ? "Redirecting…" : "Continue with Google"}
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            margin: "0 0 20px",
            color: "var(--grey)",
            fontSize: 12.5,
            textTransform: "uppercase",
            letterSpacing: ".05em",
          }}
        >
          <span style={{ flex: 1, height: 1, background: "#c7d3cf" }} />
          or
          <span style={{ flex: 1, height: 1, background: "#c7d3cf" }} />
        </div>

        <form onSubmit={handleSubmit}>
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
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <a href="/forgot-password" style={{ fontSize: 12.5, marginTop: 6, display: "inline-block" }}>
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="btn btn-amber auth-submit"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          New here? <a href="/signup">Create an account</a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
