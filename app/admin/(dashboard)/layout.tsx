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
      <Sidebar schemas={schemas} userEmail={session.user?.email} />
      <div className="admin-main">
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
