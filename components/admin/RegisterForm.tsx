"use client";

import { useState } from "react";
import { registerFirstAdminAction } from "@/app/admin/register/actions";

export default function RegisterForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await registerFirstAdminAction(formData);
    // On success the action redirects server-side, so we only ever reach
    // this line when there's an error to show.
    setPending(false);
    if (result?.error) setError(result.error);
  }

  return (
    <form action={handleSubmit} className="login-form">
      <div className="field-group">
        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
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
          name="password"
          type="password"
          required
          minLength={8}
          className="field-input"
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="confirmPassword">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className="field-input"
          placeholder="Repeat password"
          autoComplete="new-password"
        />
      </div>

      {error && <p className="field-error">{error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary btn-block">
        {pending ? "Creating account..." : "Create account & sign in"}
      </button>
    </form>
  );
}
