"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { registerFirstAdminAction } from "@/app/admin/register/actions";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordValidationError = useMemo(() => {
    if (!password && !confirmPassword) return null;
    if (password.length > 0 && password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (password && confirmPassword && password !== confirmPassword) {
      return "Passwords don't match.";
    }
    return null;
  }, [password, confirmPassword]);

  const canSubmit =
    email.trim().length > 0 &&
    password.length >= 8 &&
    confirmPassword.length >= 8 &&
    password === confirmPassword;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) {
      setError(passwordValidationError || "Please complete the form correctly.");
      return;
    }

    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await registerFirstAdminAction(formData);
    // On success the action redirects server-side, so we only ever reach
    // this line when there's an error to show.
    setPending(false);
    if (result?.error) setError(result.error);
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="field-group">
        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
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
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
            placeholder="At least 8 characters"
            autoComplete="new-password"
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

      <div className="field-group">
        <label className="field-label" htmlFor="confirmPassword">
          Confirm password
        </label>
        <div className="field-input-wrap">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="field-input"
            placeholder="Repeat password"
            autoComplete="new-password"
          />
          <button
            type="button"
            className="field-toggle"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            onClick={() => setShowConfirmPassword((prev) => !prev)}
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {passwordValidationError && (
        <p className="field-error">{passwordValidationError}</p>
      )}
      {error && <p className="field-error">{error}</p>}

      <button
        type="submit"
        disabled={pending || !canSubmit}
        className="btn btn-primary btn-block"
      >
        {pending ? "Creating account..." : "Create account & sign in"}
      </button>
    </form>
  );
}
