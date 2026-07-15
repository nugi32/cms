import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllSchemas } from "@/lib/cms-service";
import Sidebar from "@/components/admin/Sidebar";
import SignOutButton from "@/components/admin/SignOutButton";
import ThemeToggle from "@/components/ThemeToggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const schemas = getAllSchemas();

  return (
    <div className="admin-shell">
      <Sidebar schemas={schemas} />
      <div className="admin-main">
        <header className="admin-topbar">
          <ThemeToggle className="btn-sm" />
          <span className="admin-topbar-user font-mono">{session.user?.email}</span>
          <SignOutButton />
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
