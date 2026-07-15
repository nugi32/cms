"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginForm({
  callbackUrl,
  error,
}: {
  callbackUrl?: string;
  error?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(
    error ? "Invalid credentials, or that account isn't permitted." : null
  );

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setFormError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setPending(false);

    if (!res || res.error) {
      setFormError("Invalid credentials, or that account isn't permitted.");
      return;
    }

    window.location.href = callbackUrl || "/admin";
  }

  return (
    <div className="login-form-wrap">
      <form onSubmit={handleCredentialsSubmit} className="login-form">
        <div className="field-group">
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {formError && <p className="field-error">{formError}</p>}

        <button type="submit" disabled={pending} className="btn btn-primary btn-block">
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="login-divider">
        <span>or</span>
      </div>

      <button
        type="button"
        onClick={() => signIn("github", { callbackUrl: callbackUrl || "/admin" })}
        className="btn btn-github btn-block"
      >
        Continue with GitHub
      </button>
    </div>
  );
}
