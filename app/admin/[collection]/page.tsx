import Link from "next/link";
import { notFound } from "next/navigation";
import { getSchema, listItems } from "@/lib/cms-service";
import DataTable from "@/components/admin/DataTable";

export default async function CollectionPage({
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

  const items = await listItems(collection);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">{schema.label}</h1>
        <Link
          href={`/admin/${collection}/new`}
          className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800"
        >
          + New {schema.label}
        </Link>
      </div>
      <DataTable schema={schema} items={items} />
    </div>
  );
}
