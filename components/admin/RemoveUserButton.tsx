"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeAdminAction } from "@/app/admin/actions";

export default function RemoveUserButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleRemove() {
    if (!confirm("Remove this user's admin access?")) return;
    setError(null);
    startTransition(async () => {
      const result = await removeAdminAction(id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <button
        type="button"
        onClick={handleRemove}
        disabled={isPending}
        className="btn btn-danger btn-sm"
      >
        {isPending ? "Removing..." : "Remove"}
      </button>
      {error && <span className="field-error">{error}</span>}
    </span>
  );
}
