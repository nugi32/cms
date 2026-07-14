import Link from "next/link";
import { getAllSchemas, listItems } from "@/lib/cms-service";

export default async function AdminHome() {
  const schemas = getAllSchemas();
  const withCounts = await Promise.all(
    schemas.map(async (s) => ({ ...s, count: (await listItems(s.name)).length }))
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {withCounts.map((s) => (
          <Link
            key={s.name}
            href={`/admin/${s.name}`}
            className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.count}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
