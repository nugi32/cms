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
    <form action={handleSubmit} className="admin-form">
      {schema.fields.map((field) => (
        <div key={field.name} className="field-group">
          <label className="field-label">
            {field.label}
            {field.required && <span className="field-required"> *</span>}
          </label>
          {renderField(field, initialData[field.name], relationOptions[field.name])}
          {errors[field.name] && <p className="field-error">{errors[field.name]}</p>}
        </div>
      ))}

      <button type="submit" disabled={pending} className="btn btn-primary">
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
  switch (field.type) {
    case "textarea":
      return (
        <textarea
          name={field.name}
          defaultValue={value ?? ""}
          rows={4}
          className="field-textarea"
        />
      );

    case "richtext":
      // Swap this for TipTap / Lexical / etc. later — same field name keeps everything working.
      return (
        <textarea
          name={field.name}
          defaultValue={value ?? ""}
          rows={8}
          className="field-textarea"
        />
      );

    case "number":
      return (
        <input
          type="number"
          name={field.name}
          defaultValue={value ?? ""}
          className="field-input"
        />
      );

    case "boolean":
      return (
        <input
          type="checkbox"
          name={field.name}
          defaultChecked={!!value}
          className="field-checkbox"
        />
      );

    case "date":
      return (
        <input
          type="date"
          name={field.name}
          defaultValue={value ? new Date(value).toISOString().slice(0, 10) : ""}
          className="field-input"
        />
      );

    case "select":
      return (
        <select name={field.name} defaultValue={value ?? ""} className="field-select">
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
        <select name={field.name} defaultValue={value ?? ""} className="field-select">
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
          className="field-input"
        />
      );

    case "text":
    default:
      return (
        <input
          type="text"
          name={field.name}
          defaultValue={value ?? ""}
          className="field-input"
        />
      );
  }
}
