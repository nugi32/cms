"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function CorsPage() {
  const [origins, setOrigins] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    void loadOrigins();
  }, []);

  async function loadOrigins() {
    setError(null);
    const response = await fetch("/api/cors", { cache: "no-store" });
    if (!response.ok) {
      setError("Unable to load whitelisted origins.");
      return;
    }

    const data = (await response.json()) as { origins?: string[] };
    setOrigins(data.origins ?? []);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const origin = inputValue.trim();
    if (!origin) {
      setError("Please enter a URL or origin.");
      return;
    }

    startTransition(async () => {
      setError(null);
      const response = await fetch("/api/cors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        origins?: string[];
        error?: string;
      };

      if (!response.ok || !data.success) {
        setError(data.error ?? "Unable to save origin.");
        return;
      }

      setInputValue("");
      setOrigins(data.origins ?? []);
      router.refresh();
    });
  }

  async function handleRemove(origin: string) {
    startTransition(async () => {
      setError(null);
      const response = await fetch("/api/cors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        origins?: string[];
        error?: string;
      };

      if (!response.ok || !data.success) {
        setError(data.error ?? "Unable to remove origin.");
        return;
      }

      setOrigins(data.origins ?? []);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title font-display">CORS Origins</h1>
      </div>

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h2 className="admin-section-title">Add a whitelisted origin</h2>
        <p className="admin-section-hint">
          Enter a URL such as https://example.com and it will be added to the whitelist.
        </p>
        <form onSubmit={handleSubmit} className="admin-form" style={{ marginTop: 16, maxWidth: 560 }}>
          <div className="field-group">
            <label className="field-label" htmlFor="origin">
              Origin URL
            </label>
            <input
              id="origin"
              name="origin"
              className="field-input"
              placeholder="https://example.com"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
            />
          </div>
          {error && <p className="field-error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Saving..." : "Add origin"}
          </button>
        </form>
      </div>

      <div className="admin-card">
        <h2 className="admin-section-title">Whitelisted origins</h2>
        <div className="admin-table-wrap" style={{ marginTop: 12 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Origin</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {origins.length === 0 && (
                <tr>
                  <td colSpan={2} className="admin-empty-cell">
                    No origins whitelisted yet.
                  </td>
                </tr>
              )}
              {origins.map((origin) => (
                <tr key={origin}>
                  <td className="font-mono">{origin}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => void handleRemove(origin)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}