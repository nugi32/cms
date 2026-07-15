import Link from "next/link";
import { getAllSchemas, listItems } from "@/lib/cms-service";
import { listAdmins } from "@/lib/admins";
import { auth } from "@/lib/auth";

export default async function AdminHome() {
  const schemas = getAllSchemas();
  const withCounts = await Promise.all(
    schemas.map(async (s) => ({ ...s, count: (await listItems(s.name)).length }))
  );
  const [admins] = await Promise.all([listAdmins(), auth()]);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title font-display">Dashboard</h1>
      </div>

      <div className="stat-grid">
        {withCounts.map((s) => (
          <Link key={s.name} href={`/admin/${s.name}`} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value">{s.count}</p>
          </Link>
        ))}

        <Link key={"admins"} href="/admin/users" className="stat-card">
          <p className="stat-value">{admins.length}</p>
        </Link>
        
      </div>
    </div>
  );
}
