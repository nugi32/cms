"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteItemAction } from "@/app/admin/actions";

export default function DeleteButton({
  collection,
  id,
}: {
  collection: string;
  id: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this item?")) return;
    startTransition(async () => {
      await deleteItemAction(collection, id);
      router.refresh();
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
