import { getSchema } from "@/lib/cms-service";
import { apiGetItem } from "@/lib/api";
import type { CollectionSchema } from "@/lib/schemas";

/**
 * Renders every field on an entry that isn't already shown by the page
 * (title/summary/image/slug). Works for any schema — relation fields are
 * resolved to their related item's label instead of showing a raw id.
 */
export default async function EntryFields({
  schema,
  item,
  skip = [],
}: {
  schema: CollectionSchema;
  item: Record<string, any>;
  skip?: (string | undefined)[];
}) {
  const fields = schema.fields.filter(
    (f) =>
      !skip.includes(f.name) &&
      item[f.name] !== undefined &&
      item[f.name] !== null &&
      item[f.name] !== ""
  );

  const resolved = await Promise.all(
    fields.map(async (field) => {
      let display = item[field.name];

      if (field.type === "relation" && field.relationTo) {
        const related = await apiGetItem(field.relationTo, display);
        if (related) {
          getSchema(field.relationTo); // validates relationTo still exists
          const titleField = field.titleField || "name";
          display = related[titleField] ?? related._id;
        }
      } else if (field.type === "boolean") {
        display = display ? "Yes" : "No";
      } else if (field.type === "date") {
        display = new Date(display).toLocaleDateString();
      }

      return { field, display };
    })
  );

  if (resolved.length === 0) return null;

  return (
    <dl className="entry-fields">
      {resolved.map(({ field, display }) => (
        <div key={field.name} className="entry-field">
          <dt className="font-mono">{field.label}</dt>
          <dd className={field.type === "richtext" ? "entry-field-long" : ""}>
            {String(display)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
