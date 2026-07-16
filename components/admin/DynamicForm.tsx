"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadBlobAction } from "@/app/admin/actions";
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
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setErrors({});
    setUploadErrors({});

    for (const field of schema.fields) {
      if (field.type !== "image") continue;

      const selected = formData.get(field.name);
      if (selected instanceof File && selected.size > 0) {
        setUploadingFields((prev) => ({ ...prev, [field.name]: true }));
        try {
          const blob = await uploadBlobAction(selected);
          formData.set(field.name, blob.url);
        } catch (error) {
          setUploadErrors((prev) => ({
            ...prev,
            [field.name]:
              error instanceof Error ? error.message : "Image upload failed",
          }));
          setPending(false);
          setUploadingFields((prev) => ({ ...prev, [field.name]: false }));
          return;
        } finally {
          setUploadingFields((prev) => ({ ...prev, [field.name]: false }));
        }
      } else if (initialData[field.name]) {
        formData.set(field.name, String(initialData[field.name]));
      }
    }

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
          {renderField(
            field,
            initialData[field.name],
            relationOptions[field.name],
            previewUrls[field.name],
            (file) => {
              if (file) {
                setPreviewUrls((prev) => ({
                  ...prev,
                  [field.name]: URL.createObjectURL(file),
                }));
              } else {
                setPreviewUrls((prev) => ({ ...prev, [field.name]: "" }));
              }
            },
            uploadingFields[field.name]
          )}
          {errors[field.name] && <p className="field-error">{errors[field.name]}</p>}
          {uploadErrors[field.name] && (
            <p className="field-error">{uploadErrors[field.name]}</p>
          )}
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
  options?: { id: string; label: string }[],
  previewUrl?: string,
  onFileSelected?: (file: File | null) => void,
  uploading?: boolean
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
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            name={field.name}
            className="field-input"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              onFileSelected?.(file);
            }}
          />
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={`${field.label} preview`}
              width={320}
              height={240}
              className="max-h-48 w-auto rounded object-cover"
              unoptimized
            />
          ) : value ? (
            <Image
              src={String(value)}
              alt={`${field.label} current`}
              width={320}
              height={240}
              className="max-h-48 w-auto rounded object-cover"
              unoptimized
            />
          ) : null}
          {uploading ? <p className="field-hint">Uploading…</p> : null}
        </div>
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
