"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CollectionSchema } from "@/lib/schemas";

export default function Sidebar({ schemas }: { schemas: CollectionSchema[] }) {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-sidebar-logo font-display">
        CMS Admin
      </Link>

      <nav className="admin-nav">
        <span className="admin-nav-section-label">Overview</span>
        <NavLink href="/admin" pathname={pathname} exact>
          Dashboard
        </NavLink>
      </nav>

      <nav className="admin-nav">
        <span className="admin-nav-section-label">Collections</span>
        {schemas.map((s) => (
          <NavLink key={s.name} href={`/admin/${s.name}`} pathname={pathname}>
            {s.label}
          </NavLink>
        ))}
      </nav>

      <nav className="admin-nav">
        <span className="admin-nav-section-label">Developer</span>
        <NavLink href="/admin/api-routes" pathname={pathname}>
          API Routes
        </NavLink>
      </nav>

      <nav className="admin-nav">
        <span className="admin-nav-section-label">Account</span>
        <NavLink href="/admin/users" pathname={pathname}>
          Users
        </NavLink>
      </nav>
    </aside>
  );
}

function NavLink({
  href,
  pathname,
  exact = false,
  children,
}: {
  href: string;
  pathname: string;
  exact?: boolean;
  children: React.ReactNode;
}) {
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link href={href} className={active ? "active" : ""}>
      {children}
    </Link>
  );
}
