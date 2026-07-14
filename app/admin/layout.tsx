import { getAllSchemas } from "@/lib/cms-service";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schemas = getAllSchemas();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar schemas={schemas} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
