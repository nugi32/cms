import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import { CollectionSchema, schemas } from "./schemas";

export function getAllSchemas(): CollectionSchema[] {
  return schemas;
}

export function getSchema(collection: string): CollectionSchema {
  const schema = schemas.find((s) => s.name === collection);
  if (!schema) {
    throw new Error(`Unknown collection: "${collection}"`);
  }
  return schema;
}

function serialize(doc: any) {
  if (!doc) return doc;
  return { ...doc, _id: doc._id.toString() };
}

/**
 * Lists items in a collection. `filters` is a flat key/value map (e.g. from
 * URL search params) — only keys that match a real field on the schema are
 * applied, and values are coerced to that field's type. Unknown keys are
 * ignored rather than erroring, so callers can pass query params straight
 * through.
 */
export async function listItems(
  collection: string,
  filters: Record<string, string> = {}
) {
  const schema = getSchema(collection);
  const db = await getDb();

  const query: Record<string, any> = {};
  for (const [key, value] of Object.entries(filters)) {
    const field = schema.fields.find((f) => f.name === key);
    if (!field) continue;
    if (field.type === "boolean") query[key] = value === "true";
    else if (field.type === "number") query[key] = Number(value);
    else query[key] = value;
  }

  const docs = await db
    .collection(schema.name)
    .find(query)
    .sort({ _id: -1 })
    .toArray();
  return docs.map(serialize);
}

export async function getItem(collection: string, id: string) {
  const schema = getSchema(collection);
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db
    .collection(schema.name)
    .findOne({ _id: new ObjectId(id) });
  return serialize(doc);
}

/** Validates + coerces raw form/JSON input against a collection's schema */
export function validateAndCoerce(
  schema: CollectionSchema,
  raw: Record<string, any>
) {
  const data: Record<string, any> = {};
  const errors: Record<string, string> = {};

  for (const field of schema.fields) {
    let value = raw[field.name];

    const isEmpty = value === undefined || value === null || value === "";

    if (field.required && isEmpty && field.type !== "boolean") {
      errors[field.name] = `${field.label} is required`;
      continue;
    }

    if (isEmpty) {
      if (field.type === "boolean") {
        data[field.name] = value === "on" || value === true;
      }
      // leave other empty optional fields out of the document
      continue;
    }

    switch (field.type) {
      case "number": {
        const n = Number(value);
        if (Number.isNaN(n)) {
          errors[field.name] = `${field.label} must be a number`;
        } else {
          data[field.name] = n;
        }
        break;
      }
      case "boolean":
        data[field.name] = value === "on" || value === true || value === "true";
        break;
      case "date": {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) {
          errors[field.name] = `${field.label} must be a valid date`;
        } else {
          data[field.name] = d;
        }
        break;
      }
      default:
        data[field.name] = value;
    }
  }

  return { data, errors };
}

export async function createItem(collection: string, raw: Record<string, any>) {
  const schema = getSchema(collection);
  const { data, errors } = validateAndCoerce(schema, raw);
  if (Object.keys(errors).length) return { errors };

  const db = await getDb();
  data.createdAt = new Date();
  data.updatedAt = new Date();
  const result = await db.collection(schema.name).insertOne(data);
  return { id: result.insertedId.toString() };
}

export async function updateItem(
  collection: string,
  id: string,
  raw: Record<string, any>
) {
  const schema = getSchema(collection);
  const { data, errors } = validateAndCoerce(schema, raw);
  if (Object.keys(errors).length) return { errors };

  const db = await getDb();
  data.updatedAt = new Date();
  await db
    .collection(schema.name)
    .updateOne({ _id: new ObjectId(id) }, { $set: data });
  return { id };
}

export async function deleteItem(collection: string, id: string) {
  const schema = getSchema(collection);
  const db = await getDb();
  await db.collection(schema.name).deleteOne({ _id: new ObjectId(id) });
  return { success: true };
}

/** Picks the best field to use as an entry's title, for any collection */
export function getPrimaryField(schema: CollectionSchema): string {
  const preferred = ["title", "name", "heading"];
  for (const name of preferred) {
    if (schema.fields.some((f) => f.name === name)) return name;
  }
  const firstText = schema.fields.find((f) => f.type === "text");
  return firstText?.name ?? schema.fields[0]?.name ?? "_id";
}

/** Picks the best field to use as an entry's short summary, if any */
export function getSummaryField(schema: CollectionSchema): string | undefined {
  const preferred = ["excerpt", "description", "summary", "bio"];
  for (const name of preferred) {
    if (schema.fields.some((f) => f.name === name)) return name;
  }
  return schema.fields.find((f) => f.type === "textarea")?.name;
}

/** Picks the first image field, if any */
export function getImageField(schema: CollectionSchema): string | undefined {
  return schema.fields.find((f) => f.type === "image")?.name;
}

/** Builds { fieldName: [{id, label}] } for every "relation" field in a schema */
export async function getRelationOptions(schema: CollectionSchema) {
  const options: Record<string, { id: string; label: string }[]> = {};

  for (const field of schema.fields) {
    if (field.type === "relation" && field.relationTo) {
      const items = await listItems(field.relationTo);
      const titleField = field.titleField || "name";
      options[field.name] = items.map((item) => ({
        id: item._id,
        label: item[titleField] ?? item._id,
      }));
    }
  }

  return options;
}
