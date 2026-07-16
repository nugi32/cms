"use client";

import {
  LayoutDashboard,
  PanelsTopLeft,
  Users,
  Code2,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Book,
  Shield,
  Server,
  Image,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { CollectionSchema } from "@/lib/schemas";
import { signOutAction } from "@/app/admin/actions";
import ThemeToggle from "@/components/ThemeToggle";

export default function Sidebar({
  schemas,
  userEmail,
}: {
  schemas: CollectionSchema[];
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`admin-sidebar${collapsed ? " collapsed" : ""}`}>
      <div className="admin-sidebar-top">
        <Link href="/admin" className="admin-sidebar-logo font-display">
          {collapsed ? "A" : "CMS Admin"}
        </Link>
        <button
          type="button"
          className="admin-sidebar-toggle"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav className="admin-nav">
        {!collapsed && <span className="admin-nav-section-label">Overview</span>}
        <NavLink href="/admin" pathname={pathname} exact collapsed={collapsed} icon={<LayoutDashboard size={16} />} label="Dashboard" />
      </nav>

      <nav className="admin-nav">
        {!collapsed && <span className="admin-nav-section-label">Collections</span>}
        {schemas.map((s) => (
          <NavLink key={s.name} href={`/admin/${s.name}`} pathname={pathname} collapsed={collapsed} icon={<Server size={16} />} label={s.label} />
        ))}
      </nav>

      <nav className="admin-nav">
        {!collapsed && <span className="admin-nav-section-label">Developer</span>}
        <NavLink href="/admin/media" pathname={pathname} collapsed={collapsed} icon={<Image size={16} />} label="Media" />
        <NavLink href="/admin/api-routes" pathname={pathname} collapsed={collapsed} icon={<Code2 size={16} />} label="API Routes" />
        <NavLink href="/admin/cors" pathname={pathname} collapsed={collapsed} icon={<Shield size={16} />} label="CORS" />
      </nav>

      <nav className="admin-nav">
        {!collapsed && <span className="admin-nav-section-label">Account</span>}
        <NavLink href="/admin/users" pathname={pathname} collapsed={collapsed} icon={<Users size={16} />} label="Users" />
      </nav>

      <nav className="admin-nav">
        {!collapsed && <span className="admin-nav-section-label">Documentation</span>}
        <NavLink href="/admin/docs" pathname={pathname} collapsed={collapsed} icon={<Book size={16} />} label="Docs" />
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-actions">
          <ThemeToggle className="btn-sm admin-sidebar-icon-btn" />
          <form action={signOutAction}>
            <button type="submit" className="admin-sidebar-icon-btn" aria-label="Sign out">
              <LogOut size={16} />
            </button>
          </form>
        </div>
        {!collapsed && userEmail && <div className="admin-sidebar-user">{userEmail}</div>}
      </div>
    </aside>
  );
}

function NavLink({
  href,
  pathname,
  exact = false,
  icon,
  label,
  collapsed = false,
}: {
  href: string;
  pathname: string;
  exact?: boolean;
  icon: React.ReactNode;
  label: string;
  collapsed?: boolean;
}) {
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link href={href} className={`admin-nav-link${active ? " active" : ""}${collapsed ? " collapsed" : ""}`}>
      <span className="admin-nav-link-icon">{icon}</span>
      {!collapsed && <span className="admin-nav-link-label">{label}</span>}
    </Link>
  );
}
