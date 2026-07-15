import { redirect } from "next/navigation";
import { countAdmins } from "@/lib/admins";
import RegisterForm from "@/components/admin/RegisterForm";

export default async function RegisterPage() {
  const total = await countAdmins();
  if (total > 0) {
    redirect("/admin/login");
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <p className="eyebrow">Admin</p>
        <h1 className="font-display login-title">Create the first account</h1>
        <p className="login-sub">
          No admin account exists yet. Whoever registers here becomes the
          first admin and can invite others later from Users.
        </p>
        <RegisterForm />
      </div>
    </div>
  );
}
