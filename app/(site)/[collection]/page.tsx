import Link from "next/link";
import { notFound } from "next/navigation";
import { getSchema, getPrimaryField, getSummaryField } from "@/lib/cms-service";
import { apiGetCollection } from "@/lib/api";

export const revalidate = 30;

export default async function CollectionIndexPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;

  let schema;
  try {
    schema = getSchema(collection);
  } catch {
    notFound();
  }

  const items = await apiGetCollection(collection);
  const titleField = getPrimaryField(schema);
  const summaryField = getSummaryField(schema);

  return (
    <div className="wrap">
      <header className="collection-head">
        <p className="eyebrow">Collection</p>
        <h1 className="font-display">{schema.label}</h1>
        <p className="font-mono hero-meta">
          {items.length} {items.length === 1 ? "entry" : "entries"}
        </p>
      </header>

      <section className="index">
        {items.length === 0 && (
          <p className="empty font-mono">Nothing here yet.</p>
        )}
        {items.map((item, i) => (
          <Link
            key={item._id}
            href={`/${collection}/${item.slug ?? item._id}`}
            className="index-row"
          >
            <span className="index-num font-mono">
              {String(i + 1).padStart(3, "0")}
            </span>
            <span className="index-title-block">
              <span className="index-title font-display">
                {item[titleField] ?? "Untitled"}
              </span>
              {summaryField && item[summaryField] && (
                <span className="index-summary">{item[summaryField]}</span>
              )}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
