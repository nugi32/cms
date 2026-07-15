import { notFound } from "next/navigation";
import { getSchema, getItem, getRelationOptions } from "@/lib/cms-service";
import DynamicForm from "@/components/admin/DynamicForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { updateItemAction } from "@/app/admin/actions";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}) {
  const { collection, id } = await params;

  let schema;
  try {
    schema = getSchema(collection);
  } catch {
    notFound();
  }

  const item = await getItem(collection, id);
  if (!item) notFound();

  const relationOptions = await getRelationOptions(schema);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title font-display">Edit {schema.label}</h1>
        <DeleteButton collection={collection} id={id} />
      </div>
      <div className="admin-card">
        <DynamicForm
          schema={schema}
          initialData={item}
          action={updateItemAction.bind(null, collection, id)}
          relationOptions={relationOptions}
        />
      </div>
    </div>
  );
}
