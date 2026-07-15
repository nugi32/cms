"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { addAdminAction } from "@/app/admin/actions";

export default function AddUserForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await addAdminAction(formData);
    setPending(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <form action={handleSubmit} className="admin-form" style={{ maxWidth: 420 }}>
      <div className="field-group">
        <label className="field-label">
          Email<span className="field-required"> *</span>
        </label>
        <input
          name="email"
          type="email"
          required
          className="field-input"
          placeholder="teammate@example.com"
        />
      </div>
      <div className="field-group">
        <label className="field-label">Password (optional)</label>
        <div className="field-input-wrap">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            className="field-input"
            placeholder="Leave blank for GitHub-only sign-in"
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
      {error && <p className="field-error">{error}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Adding..." : "Add user"}
      </button>
    </form>
  );
}
