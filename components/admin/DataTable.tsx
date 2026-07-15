import Link from "next/link";
import type { CollectionSchema } from "@/lib/schemas";
import DeleteButton from "./DeleteButton";

export default function DataTable({
  schema,
  items,
}: {
  schema: CollectionSchema;
  items: any[];
}) {
  const columns = schema.fields.slice(0, 4);

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.name}>{c.label}</th>
            ))}
            <th />
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1} className="admin-empty-cell">
                No {schema.label.toLowerCase()} yet.
              </td>
            </tr>
          )}
          {items.map((item) => (
            <tr key={item._id}>
              {columns.map((c) => (
                <td key={c.name}>{formatValue(item[c.name], c.type)}</td>
              ))}
              <td>
                <div className="admin-table-actions">
                  <Link href={`/admin/${schema.name}/${item._id}`} className="table-link">
                    Edit
                  </Link>
                  <DeleteButton collection={schema.name} id={item._id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatValue(value: any, type: string) {
  if (value === undefined || value === null || value === "") return "—";
  if (type === "boolean") {
    return (
      <span className={`badge ${value ? "badge-yes" : "badge-no"}`}>
        {value ? "Yes" : "No"}
      </span>
    );
  }
  if (type === "date") return new Date(value).toLocaleDateString();
  const str = String(value);
  return str.length > 60 ? str.slice(0, 60) + "…" : str;
}
