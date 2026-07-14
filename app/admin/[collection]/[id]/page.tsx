import { notFound } from "next/navigation";
import { getSchema, getItem, getRelationOptions } from "@/lib/cms-service";
import DynamicForm from "@/components/admin/DynamicForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { updateItemAction } from "../../actions";

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Edit {schema.label}</h1>
        <DeleteButton collection={collection} id={id} />
      </div>
      <DynamicForm
        schema={schema}
        initialData={item}
        action={updateItemAction.bind(null, collection, id)}
        relationOptions={relationOptions}
      />
    </div>
  );
}
