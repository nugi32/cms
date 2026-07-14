import Link from "next/link";
import { getAllSchemas, getPrimaryField } from "@/lib/cms-service";
import { apiGetCollection } from "@/lib/api";

export const revalidate = 30;

export default async function HomePage() {
  const schemas = getAllSchemas();

  const perCollection = await Promise.all(
    schemas.map(async (schema) => {
      const items = await apiGetCollection(schema.name);
      const titleField = getPrimaryField(schema);
      return items.map((item) => ({
        ...item,
        __collection: schema.name,
        __label: schema.label,
        __title: item[titleField] ?? "Untitled",
      }));
    })
  );

  const flat = perCollection.flat();
  const entries = [...flat]
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    )
    .slice(0, 20);

  return (
    <div className="wrap">
      <section className="hero">
        <p className="eyebrow">Live archive</p>
        <h1 className="font-display hero-title">
          A living archive,
          <br />
          indexed automatically.
        </h1>
        <p className="hero-sub">
          Everything below is fetched from <code>/api</code> at request time.
          Add a collection or field to <code>lib/schemas.ts</code> and it
          shows up here — no page code to touch.
        </p>
        <p className="font-mono hero-meta">
          {flat.length} {flat.length === 1 ? "entry" : "entries"} across{" "}
          {schemas.length} {schemas.length === 1 ? "collection" : "collections"}
        </p>
      </section>

      <section className="index">
        {entries.length === 0 && (
          <p className="empty font-mono">
            No entries yet. Add one from /admin.
          </p>
        )}
        {entries.map((entry, i) => (
          <Link
            key={`${entry.__collection}-${entry._id}`}
            href={`/${entry.__collection}/${entry.slug ?? entry._id}`}
            className="index-row"
          >
            <span className="index-num font-mono">
              {String(i + 1).padStart(3, "0")}
            </span>
            <span className="index-title-block">
              <span className="index-title font-display">{entry.__title}</span>
            </span>
            <span className="index-tag font-mono">{entry.__label}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
