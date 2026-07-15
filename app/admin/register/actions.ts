"use server";

import {
  claimFirstAdminSetup,
  countAdmins,
  createAdminWithPassword,
  findAdminByEmail,
  releaseFirstAdminSetup,
} from "@/lib/admins";
import { signIn } from "@/lib/auth";

export async function registerFirstAdminAction(formData: FormData) {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords don't match." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const claimSucceeded = await claimFirstAdminSetup();

  try {
    // Re-check here too (not just on the page) in case two people load the
    // register page at the same moment.
    const total = await countAdmins();
    if (total > 0) {
      return {
        error: "Registration is closed. Ask an existing admin to add your account from /admin/users.",
      };
    }

    const existing = await findAdminByEmail(email);
    if (existing) {
      return { error: "An account with that email already exists." };
    }

    if (!claimSucceeded) {
      return {
        error: "Registration is already in progress. Please wait a moment and try again.",
      };
    }

    await createAdminWithPassword(email, password);

    // Signs the brand-new admin in and redirects to /admin.
    await signIn("credentials", { email, password, redirectTo: "/admin" });
  } finally {
    if (claimSucceeded) {
      await releaseFirstAdminSetup();
    }
  }
}
