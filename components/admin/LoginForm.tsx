"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
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
          <div className="field-input-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="field-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
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
        aria-label="Continue with GitHub"
      >
        <span className="github-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.725-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.833 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.304-5.466-1.334-5.466-5.93 0-1.31.468-2.381 1.235-3.221-.123-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 3.003-.404c1.02 0 2.047.137 3.003.404 2.293-1.552 3.301-1.23 3.301-1.23.653 1.653.241 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.596 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
        </span>
        <span>GitHub</span>
      </button>
    </div>
  );
}
