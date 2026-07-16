"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteBlobAction } from "@/app/admin/actions";

export default function DeleteBlobButton({ url }: { url: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this media file?")) return;
    startTransition(async () => {
      const result = await deleteBlobAction(url);
      if (!result?.error) {
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="btn btn-danger btn-sm"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
