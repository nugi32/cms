/**
 * Only emails in this list may sign in to /admin — whether they come
 * through the email/password form or GitHub OAuth. Both providers are
 * checked against this in lib/auth.ts's `signIn` callback.
 */
const raw = process.env.ALLOWED_ADMIN_EMAILS || "";

export const allowedEmails = raw
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isWhitelisted(email?: string | null): boolean {
  if (!email) return false;
  return allowedEmails.includes(email.toLowerCase());
}
