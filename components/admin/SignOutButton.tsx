import { signOutAction } from "@/app/admin/actions";

export default function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button type="submit" className="btn btn-ghost btn-sm">
        Sign out
      </button>
    </form>
  );
}
