import { listAdmins } from "@/lib/admins";
import { auth } from "@/lib/auth";
import AddUserForm from "@/components/admin/AddUserForm";
import RemoveUserButton from "@/components/admin/RemoveUserButton";

export default async function UsersPage() {
  const [admins, session] = await Promise.all([listAdmins(), auth()]);
  const currentEmail = session?.user?.email?.toLowerCase();

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title font-display">Users</h1>
      </div>

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h2 className="admin-section-title">Add a user</h2>
        <p className="admin-section-hint">
          Set a password so they can sign in with email + password, or leave
          it blank to only allow that email in via GitHub OAuth.
        </p>
        <div style={{ marginTop: 16 }}>
          <AddUserForm />
        </div>
      </div>

      <div className="admin-card">
        <h2 className="admin-section-title">Existing users</h2>
        <div className="admin-table-wrap" style={{ marginTop: 12 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Sign-in method</th>
                <th>Added</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 && (
                <tr>
                  <td colSpan={4} className="admin-empty-cell">
                    No users yet.
                  </td>
                </tr>
              )}
              {admins.map((a) => (
                <tr key={a.id}>
                  <td>{a.email}</td>
                  <td>
                    <span className={`badge ${a.hasPassword ? "badge-yes" : "badge-no"}`}>
                      {a.hasPassword ? "Password + GitHub" : "GitHub only"}
                    </span>
                  </td>
                  <td>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}</td>
                  <td>
                    <div className="admin-table-actions">
                      {currentEmail !== a.email && <RemoveUserButton id={a.id} />}
                    </div>
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
