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

  if (items.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
        No {schema.label.toLowerCase()} yet.
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-gray-50 text-left">
            {columns.map((c) => (
              <th key={c.name} className="py-3 px-4 text-sm font-medium text-gray-500">
                {c.label}
              </th>
            ))}
            <th className="py-3 px-4" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id} className="border-b last:border-0 hover:bg-gray-50">
              {columns.map((c) => (
                <td key={c.name} className="py-3 px-4 text-sm">
                  {formatValue(item[c.name], c.type)}
                </td>
              ))}
              <td className="py-3 px-4 text-right whitespace-nowrap">
                <Link
                  href={`/admin/${schema.name}/${item._id}`}
                  className="text-blue-600 hover:underline text-sm mr-4"
                >
                  Edit
                </Link>
                <DeleteButton collection={schema.name} id={item._id} />
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
  if (type === "boolean") return value ? "Yes" : "No";
  if (type === "date") return new Date(value).toLocaleDateString();
  const str = String(value);
  return str.length > 60 ? str.slice(0, 60) + "…" : str;
}
