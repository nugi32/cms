import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getSchema,
  getPrimaryField,
  getSummaryField,
  getImageField,
} from "@/lib/cms-service";
import { apiGetCollection, apiGetItem } from "@/lib/api";
import EntryFields from "@/components/site/EntryFields";

export const revalidate = 30;

export default async function EntryDetailPage({
  params,
}: {
  params: Promise<{ collection: string; slug: string }>;
}) {
  const { collection, slug } = await params;

  let schema;
  try {
    schema = getSchema(collection);
  } catch {
    notFound();
  }

  // Resolve by "slug" field first (if the schema has one), falling back to
  // treating the URL segment as a raw MongoDB id.
  const hasSlugField = schema.fields.some((f) => f.name === "slug");
  let item: Record<string, any> | null = null;

  if (hasSlugField) {
    const matches = await apiGetCollection(collection, { slug });
    item = matches[0] ?? null;
  }
  if (!item) {
    item = await apiGetItem(collection, slug);
  }
  if (!item) notFound();

  const titleField = getPrimaryField(schema);
  const summaryField = getSummaryField(schema);
  const imageField = getImageField(schema);

  return (
    <article className="wrap article">
      <p className="eyebrow">{schema.label}</p>
      <h1 className="font-display article-title">
        {item[titleField] ?? "Untitled"}
      </h1>
      {item.createdAt && (
        <p className="font-mono hero-meta">
          {new Date(item.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      )}

      {imageField && item[imageField] && (
        <Image
          src={item[imageField]}
          alt=""
          width={1200}
          height={800}
          className="article-image"
          unoptimized
        />
      )}

      {summaryField && item[summaryField] && (
        <p className="article-summary">{item[summaryField]}</p>
      )}

      <EntryFields
        schema={schema}
        item={item}
        skip={[titleField, summaryField, imageField, "slug"]}
      />
    </article>
  );
}
