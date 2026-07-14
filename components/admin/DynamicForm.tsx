"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CollectionSchema, FieldSchema } from "@/lib/schemas";

type ActionResult = { id?: string; errors?: Record<string, string> };

export default function DynamicForm({
  schema,
  initialData = {},
  action,
  relationOptions = {},
}: {
  schema: CollectionSchema;
  initialData?: Record<string, any>;
  action: (formData: FormData) => Promise<ActionResult>;
  relationOptions?: Record<string, { id: string; label: string }[]>;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setErrors({});
    const result = await action(formData);
    setPending(false);

    if (result?.errors) {
      setErrors(result.errors);
      return;
    }

    router.push(`/admin/${schema.name}`);
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="space-y-5 max-w-xl bg-white border rounded-lg p-6">
      {schema.fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium mb-1">
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
          </label>
          {renderField(field, initialData[field.name], relationOptions[field.name])}
          {errors[field.name] && (
            <p className="text-sm text-red-500 mt-1">{errors[field.name]}</p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={pending}
        className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}

function renderField(
  field: FieldSchema,
  value: any,
  options?: { id: string; label: string }[]
) {
  const baseClass = "w-full border rounded-md px-3 py-2 text-sm";

  switch (field.type) {
    case "textarea":
      return (
        <textarea
          name={field.name}
          defaultValue={value ?? ""}
          rows={4}
          className={baseClass}
        />
      );

    case "richtext":
      // Swap this for TipTap / Lexical / etc. later — same field name keeps everything working.
      return (
        <textarea
          name={field.name}
          defaultValue={value ?? ""}
          rows={8}
          className={baseClass}
        />
      );

    case "number":
      return (
        <input
          type="number"
          name={field.name}
          defaultValue={value ?? ""}
          className={baseClass}
        />
      );

    case "boolean":
      return (
        <input
          type="checkbox"
          name={field.name}
          defaultChecked={!!value}
          className="h-5 w-5"
        />
      );

    case "date":
      return (
        <input
          type="date"
          name={field.name}
          defaultValue={value ? new Date(value).toISOString().slice(0, 10) : ""}
          className={baseClass}
        />
      );

    case "select":
      return (
        <select name={field.name} defaultValue={value ?? ""} className={baseClass}>
          <option value="">Select...</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case "relation":
      return (
        <select name={field.name} defaultValue={value ?? ""} className={baseClass}>
          <option value="">Select...</option>
          {options?.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case "image":
      return (
        <input
          type="url"
          name={field.name}
          defaultValue={value ?? ""}
          placeholder="https://..."
          className={baseClass}
        />
      );

    case "text":
    default:
      return (
        <input
          type="text"
          name={field.name}
          defaultValue={value ?? ""}
          className={baseClass}
        />
      );
  }
}
