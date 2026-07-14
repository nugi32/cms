import Link from "next/link";
import type { CollectionSchema } from "@/lib/schemas";

export default function Header({ schemas }: { schemas: CollectionSchema[] }) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo font-display">
          The Archive
        </Link>
        <nav className="site-nav font-mono">
          {schemas.map((s) => (
            <Link key={s.name} href={`/${s.name}`}>
              {s.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
