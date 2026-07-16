/**
 * ============================================================
 *  THIS IS THE ONLY FILE YOU NEED TO EDIT.
 *
 *  Add / remove / change collections and fields here and the
 *  admin UI (sidebar, list tables, create/edit forms) and the
 *  REST API automatically follow — no other code changes needed.
 * ============================================================
 */

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "boolean"
  | "date"
  | "select"
  | "image"
  | "relation";

export interface FieldSchema {
  /** key stored in MongoDB, e.g. "title" */
  name: string;
  /** label shown in the UI */
  label: string;
  type: FieldType;
  required?: boolean;
  /** only for type: "select" */
  options?: string[];
  /** only for type: "relation" — name of the collection it points to */
  relationTo?: string;
  /** only for type: "relation" — which field to display in the dropdown (defaults to "name") */
  titleField?: string;
}

export interface CollectionSchema {
  /** slug + MongoDB collection name, e.g. "posts" */
  name: string;
  /** label shown in the UI */
  label: string;
  fields: FieldSchema[];
}

export const schemas: CollectionSchema[] = [
  {
    name: "posts",
    label: "Posts",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "content", label: "Content", type: "richtext" },
      // NEW: Vercel Blob upload
      { name: "coverImage", label: "Cover Image", type: "image" },
      {
        name: "category",
        label: "Category",
        type: "relation",
        relationTo: "categories",
        titleField: "name",
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["draft", "published"],
      },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "publishDate", label: "Publish Date", type: "date" },
    ],
  },
  {
    name: "categories",
    label: "Categories",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },

  {
    name: "test",
    label: "Test",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
   
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["draft", "published"],
      },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "publishDate", label: "Publish Date", type: "date" },
    ],
  },

  

  // 👉 Add a new collection just by adding another object here, e.g.:
  // {
  //   name: "authors",
  //   label: "Authors",
  //   fields: [
  //     { name: "name", label: "Name", type: "text", required: true },
  //     { name: "bio", label: "Bio", type: "textarea" },
  //   ],
  // },
];
