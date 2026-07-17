import Link from "next/link";
import { getAllSchemas, listItems } from "@/lib/cms-service";

export const revalidate = 30;

export default async function HomePage() {
  const schemas = getAllSchemas();

  const total = (
    await Promise.all(schemas.map((s) => listItems(s.name)))
  ).reduce((sum, items) => sum + items.length, 0);

  return (
    <div className="wrap">
      <section className="hero" style={{ borderBottom: "none" }}>
        <p className="eyebrow">Welcome</p>
        <h1 className="font-display hero-title">Welcome to The Archive.</h1>
        <p className="hero-sub">
          A schema-driven CMS — content lives in MongoDB, the public API is
          read-only, and everything here follows whatever you define in{" "}
          <code>lib/schemas.ts</code>.
        </p>
        <p className="font-mono hero-meta" style={{ marginBottom: 28 }}>
          {total} {total === 1 ? "entry" : "entries"} across {schemas.length}{" "}
          {schemas.length === 1 ? "collection" : "collections"}
        </p>
        <Link href="/admin" className="btn btn-primary">
          Go to Admin →
        </Link>
      </section>
    </div>
  );
}