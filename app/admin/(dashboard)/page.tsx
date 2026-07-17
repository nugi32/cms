import Link from "next/link";
import { getAllSchemas, listItems, getPrimaryField } from "@/lib/cms-service";
import { listAdmins } from "@/lib/admins";
import { auth } from "@/lib/auth";

export default async function AdminHome() {
  const schemas = getAllSchemas();

  const [itemsPerSchema, admins, session] = await Promise.all([
    Promise.all(schemas.map((s) => listItems(s.name))),
    listAdmins(),
    auth(),
  ]);

  const withCounts = schemas.map((s, i) => ({ ...s, count: itemsPerSchema[i].length }));

  const recent = schemas
    .flatMap((s, i) => {
      const titleField = getPrimaryField(s);
      return itemsPerSchema[i].map((item) => ({
        ...item,
        __collection: s.name,
        __label: s.label,
        __title: item[titleField] ?? "Untitled",
      }));
    })
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() -
        new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
    )
    .slice(0, 8);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const displayName = (session?.user?.name || session?.user?.email || "there").split("@")[0];
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title font-display">
            {greeting}, {displayName}
          </h1>
          <p className="admin-section-hint">{today}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "4px 0 28px" }}>
        {schemas.map((s) => (
          <Link key={s.name} href={`/admin/${s.name}/new`} className="btn btn-secondary btn-sm">
            + New {s.label}
          </Link>
        ))}
      </div>

      <div className="stat-grid" style={{ marginBottom: 32 }}>
        {withCounts.map((s) => (
          <Link key={s.name} href={`/admin/${s.name}`} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value">{s.count}</p>
          </Link>
        ))}

        <Link href="/admin/users" className="stat-card">
          <p className="stat-label">Users</p>
          <p className="stat-value">{admins.length}</p>
        </Link>
      </div>

      <div className="admin-card">
        <h2 className="admin-section-title">Recent activity</h2>
        <div className="admin-table-wrap" style={{ marginTop: 12 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Entry</th>
                <th>Collection</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr>
                  <td colSpan={4} className="admin-empty-cell">
                    Nothing here yet — create your first entry above.
                  </td>
                </tr>
              )}
              {recent.map((item) => (
                <tr key={`${item.__collection}-${item._id}`}>
                  <td>{item.__title}</td>
                  <td>
                    <span className="badge badge-no">{item.__label}</span>
                  </td>
                  <td>
                    {new Date(item.updatedAt ?? item.createdAt ?? Date.now()).toLocaleString()}
                  </td>
                  <td>
                    <Link href={`/admin/${item.__collection}/${item._id}`} className="table-link">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
