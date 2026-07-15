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
      <div className="admin-page-header">
        <h1 className="admin-page-title font-display">{schema.label}</h1>
        <Link href={`/admin/${collection}/new`} className="btn btn-primary">
          + New {schema.label}
        </Link>
      </div>
      <DataTable schema={schema} items={items} />
    </div>
  );
}
