"use server";

import { revalidatePath } from "next/cache";
import { createItem, updateItem, deleteItem } from "@/lib/cms-service";

export async function createItemAction(collection: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const result = await createItem(collection, raw);
  if (!("errors" in result)) {
    revalidatePath(`/admin/${collection}`);
  }
  return result;
}

export async function updateItemAction(
  collection: string,
  id: string,
  formData: FormData
) {
  const raw = Object.fromEntries(formData.entries());
  const result = await updateItem(collection, id, raw);
  if (!("errors" in result)) {
    revalidatePath(`/admin/${collection}`);
    revalidatePath(`/admin/${collection}/${id}`);
  }
  return result;
}

export async function deleteItemAction(collection: string, id: string) {
  await deleteItem(collection, id);
  revalidatePath(`/admin/${collection}`);
}
