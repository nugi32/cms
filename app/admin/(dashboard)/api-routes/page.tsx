import { getAllSchemas } from "@/lib/cms-service";
import { customApiRoutes } from "@/lib/api-routes";

export default function ApiRoutesPage() {
  const schemas = getAllSchemas();

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title font-display">API Routes</h1>
      </div>

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h2 className="admin-section-title">Generic (auto-generated per collection)</h2>
        <div className="admin-table-wrap" style={{ marginTop: 12 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Path</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {schemas.map((s) => (
                <>
                  <tr key={`${s.name}-list`}>
                    <td>
                      <span className="method-badge method-get">GET</span>
                    </td>
                    <td className="font-mono">/api/{s.name}</td>
                    <td>
                      List {s.label.toLowerCase()}. Supports equality filters,
                      e.g. <code>?status=published</code>.
                    </td>
                  </tr>
                  <tr key={`${s.name}-item`}>
                    <td>
                      <span className="method-badge method-get">GET</span>
                    </td>
                    <td className="font-mono">/api/{s.name}/:id</td>
                    <td>Get a single {s.label.toLowerCase().slice(0, -1) || s.label} by id.</td>
                  </tr>
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card">
        <h2 className="admin-section-title">Custom routes</h2>
        <p className="admin-section-hint">
          Hand-written routes registered in <code>lib/api-routes.ts</code>. Add a
          new file under <code>app/api/</code> and list it there to document it here.
        </p>
        <div className="admin-table-wrap" style={{ marginTop: 12 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Path</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {customApiRoutes.map((r) => (
                <tr key={r.path}>
                  <td>
                    <span className={`method-badge method-${r.method.toLowerCase()}`}>
                      {r.method}
                    </span>
                  </td>
                  <td className="font-mono">{r.path}</td>
                  <td>{r.description}</td>
                </tr>
              ))}
              {customApiRoutes.length === 0 && (
                <tr>
                  <td colSpan={3} className="admin-empty-cell">
                    No custom routes yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
