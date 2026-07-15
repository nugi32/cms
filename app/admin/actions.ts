"use server";

import { revalidatePath } from "next/cache";
import { createItem, updateItem, deleteItem } from "@/lib/cms-service";
import { signOut } from "@/lib/auth";
import {
  findAdminByEmail,
  createAdminWithPassword,
  createAdminEmailOnly,
  countAdmins,
  deleteAdmin,
} from "@/lib/admins";

export async function signOutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

export async function addAdminAction(formData: FormData) {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");

  if (!email) return { error: "Email is required." };

  const existing = await findAdminByEmail(email);
  if (existing) return { error: "That email already has admin access." };

  if (password) {
    if (password.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }
    await createAdminWithPassword(email, password);
  } else {
    // No password set - this account can only sign in via GitHub OAuth
    // using this exact email.
    await createAdminEmailOnly(email);
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function removeAdminAction(id: string) {
  const total = await countAdmins();
  if (total <= 1) {
    return { error: "Can't remove the last remaining user." };
  }
  await deleteAdmin(id);
  revalidatePath("/admin/users");
  return { success: true };
}

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
