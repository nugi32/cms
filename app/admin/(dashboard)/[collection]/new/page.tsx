import { notFound } from "next/navigation";
import { getSchema, getRelationOptions } from "@/lib/cms-service";
import DynamicForm from "@/components/admin/DynamicForm";
import { createItemAction } from "@/app/admin/actions";

export default async function NewItemPage({
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

  const relationOptions = await getRelationOptions(schema);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title font-display">New {schema.label}</h1>
      </div>
      <div className="admin-card">
        <DynamicForm
          schema={schema}
          action={createItemAction.bind(null, collection)}
          relationOptions={relationOptions}
        />
      </div>
    </div>
  );
}
