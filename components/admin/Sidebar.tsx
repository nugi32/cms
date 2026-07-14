"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CollectionSchema } from "@/lib/schemas";

export default function Sidebar({ schemas }: { schemas: CollectionSchema[] }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 border-r bg-white min-h-screen p-4">
      <Link href="/admin" className="block font-bold text-lg mb-6">
        CMS Admin
      </Link>
      <nav className="space-y-1">
        {schemas.map((s) => {
          const href = `/admin/${s.name}`;
          const active = pathname.startsWith(href);
          return (
            <Link
              key={s.name}
              href={href}
              className={`block px-3 py-2 rounded-md text-sm ${
                active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
