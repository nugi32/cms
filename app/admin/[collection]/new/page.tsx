import { notFound } from "next/navigation";
import { getSchema, getRelationOptions } from "@/lib/cms-service";
import DynamicForm from "@/components/admin/DynamicForm";
import { createItemAction } from "../../actions";

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
      <h1 className="text-2xl font-semibold mb-6">New {schema.label}</h1>
      <DynamicForm
        schema={schema}
        action={createItemAction.bind(null, collection)}
        relationOptions={relationOptions}
      />
    </div>
  );
}
