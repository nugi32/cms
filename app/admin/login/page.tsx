import Link from "next/link";
import { countAdmins } from "@/lib/admins";
import LoginForm from "@/components/admin/LoginForm";
import ThemeToggle from "@/components/ThemeToggle";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const total = await countAdmins();

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-card-top">
          <p className="eyebrow">Admin</p>
          <ThemeToggle className="btn-sm" />
        </div>
        <h1 className="font-display login-title">Sign in</h1>
        <p className="login-sub">
          {total === 0
            ? "No admin account exists yet."
            : "Access is limited to existing admin accounts."}
        </p>
        <LoginForm callbackUrl={callbackUrl} error={error} />
        {total === 0 && (
          <p className="login-footnote">
            <Link href="/admin/register" className="table-link">
              Create the first admin account →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
