export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <h1 className="admin-page-title font-display">Developer documentation</h1>
        <p className="admin-page-subtitle">
          This page is the reference for extending the CMS: add collections,
          create custom routes, wire new field types, and adjust admin behavior.
        </p>
      </div>

      <section className="admin-card">
        <h2 className="mb-3 text-xl font-semibold">Architecture at a glance</h2>
        <p className="docs-text mb-4">
          The project is built around a schema-driven model. The single source of
          truth is <span className="docs-inline-code font-mono">lib/schemas.ts</span>. Once a
          collection is added there, the admin UI, public pages, and generic API
          routes can follow it automatically.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-semibold">Core files</h3>
            <ul className="docs-list mt-2 space-y-1">
              <li><span className="docs-inline-code font-mono">lib/schemas.ts</span> — defines collections and fields</li>
              <li><span className="docs-inline-code font-mono">lib/cms-service.ts</span> — CRUD helpers, validation, relation lookup</li>
              <li><span className="docs-inline-code font-mono">components/admin/DynamicForm.tsx</span> — renders forms from schema</li>
              <li><span className="docs-inline-code font-mono">app/admin/actions.ts</span> — server actions for create/update/delete</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Where to extend</h3>
            <ul className="docs-list mt-2 space-y-1">
              <li><span className="docs-inline-code font-mono">app/api/</span> — custom API routes</li>
              <li><span className="docs-inline-code font-mono">lib/api-routes.ts</span> — route reference list shown in admin</li>
              <li><span className="docs-inline-code font-mono">app/(site)/</span> — public pages that consume the API</li>
              <li><span className="docs-inline-code font-mono">lib/auth.ts</span> and <span className="docs-inline-code font-mono">lib/admins.ts</span> — auth and admin accounts</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="admin-card">
        <h2 className="mb-3 text-xl font-semibold">Add a new collection or schema</h2>
        <p className="docs-text mb-4">
          The schema file is the main configuration layer. Adding an entry here is
          enough for the admin dashboard and generic data endpoints to pick it up.
        </p>

        <pre className="docs-code">
{`// lib/schemas.ts
{
  name: "authors",
  label: "Authors",
  fields: [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "bio", label: "Bio", type: "textarea" },
    { name: "website", label: "Website", type: "text" },
    { name: "featured", label: "Featured", type: "boolean" },
  ],
},`}
        </pre>

        <ul className="docs-list mt-4 space-y-2">
          <li>The collection name becomes the slug used in the admin UI, such as <span className="docs-inline-code font-mono">/admin/authors</span>.</li>
          <li>The field names are stored in MongoDB and used by the generic API at <span className="docs-inline-code font-mono">/api/authors</span>.</li>
          <li>Use <span className="docs-inline-code font-mono">relation</span> fields for parent/child relationships, for example posts linking to categories.</li>
        </ul>
      </section>

      <section className="admin-card">
        <h2 className="mb-3 text-xl font-semibold">Field types supported by default</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <h3 className="font-semibold">Built-in field types</h3>
            <ul className="docs-list mt-2 space-y-1">
              <li><span className="docs-inline-code font-mono">text</span></li>
              <li><span className="docs-inline-code font-mono">textarea</span></li>
              <li><span className="docs-inline-code font-mono">richtext</span></li>
              <li><span className="docs-inline-code font-mono">number</span></li>
              <li><span className="docs-inline-code font-mono">boolean</span></li>
              <li><span className="docs-inline-code font-mono">date</span></li>
              <li><span className="docs-inline-code font-mono">select</span></li>
              <li><span className="docs-inline-code font-mono">image</span></li>
              <li><span className="docs-inline-code font-mono">relation</span></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">When you add a new field type</h3>
            <ol className="docs-list mt-2 space-y-2">
              <li>Update the switch in <span className="docs-inline-code font-mono">components/admin/DynamicForm.tsx</span> to render it correctly in the admin form.</li>
              <li>Update <span className="docs-inline-code font-mono">lib/cms-service.ts</span> inside <span className="docs-inline-code font-mono">validateAndCoerce</span> so values are validated and coerced.</li>
              <li>If the new field needs special behavior (for example upload handling or relation lookups), add it in the CMS service or admin actions.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="admin-card">
        <h2 className="mb-3 text-xl font-semibold">Create a custom API route</h2>
        <p className="docs-text mb-4">
          Generic collection endpoints are already created for every schema entry.
          For a hand-written route, add a normal Next.js route file under <span className="docs-inline-code font-mono">app/api/</span>.
        </p>

        <pre className="docs-code">
{`// app/api/posts/featured/route.ts
import { NextResponse } from "next/server";
import { listItems } from "@/lib/cms-service";

export async function GET() {
  const items = await listItems("posts", { featured: "true" });
  return NextResponse.json({ data: items });
}`}
        </pre>

        <ul className="docs-list mt-4 space-y-2">
          <li>Place routes under <span className="docs-inline-code font-mono">app/api/</span> just like any other Next.js route.</li>
          <li>More specific paths such as <span className="docs-inline-code font-mono">app/api/posts/featured/route.ts</span> take precedence over the generic dynamic routes.</li>
          <li>Register the route in <span className="docs-inline-code font-mono">lib/api-routes.ts</span> so it appears in the admin reference page at <span className="docs-inline-code font-mono">/admin/api-routes</span>.</li>
        </ul>
      </section>

      <section className="admin-card">
        <h2 className="mb-3 text-xl font-semibold">Create a custom admin action</h2>
        <p className="docs-text mb-4">
          The admin uses server actions in <span className="docs-inline-code font-mono">app/admin/actions.ts</span> for create, update, delete, uploads, and admin user management.
          If you need a new operation, add it there and call it from a form or button in the admin area.
        </p>

        <pre className="docs-code">
{`"use server";

import { revalidatePath } from "next/cache";
import { createItem } from "@/lib/cms-service";

export async function createAuthorAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const result = await createItem("authors", raw);
  if (!("errors" in result)) {
    revalidatePath("/admin/authors");
  }
  return result;
}`}
        </pre>
      </section>

      <section className="admin-card">
        <h2 className="mb-3 text-xl font-semibold">Validation and data coercion</h2>
        <p className="docs-text mb-4">
          The CMS service validates incoming form data before it reaches MongoDB. That is the place to enforce required fields, numbers, booleans, dates, and any future custom rules.
        </p>
        <ul className="docs-list space-y-2">
          <li><span className="docs-inline-code font-mono">validateAndCoerce</span> loops over every field in the schema and builds a safe object.</li>
          <li>Required fields throw validation errors before insert/update.</li>
          <li>Boolean and number values are coerced from form submissions so they are stored as the right runtime type.</li>
        </ul>
      </section>

      <section className="admin-card">
        <h2 className="mb-3 text-xl font-semibold">Useful conventions for future work</h2>
        <ul className="docs-list space-y-2">
          <li>Keep <span className="docs-inline-code font-mono">lib/schemas.ts</span> as the single place for content model changes.</li>
          <li>When you add a new collection, use a clear singular/plural naming pattern and a friendly label.</li>
          <li>Prefer server actions for data mutation and keep public reads through the generic API or custom route handlers.</li>
          <li>If you add media features, the upload flow already exists in <span className="docs-inline-code font-mono">app/admin/actions.ts</span> and <span className="docs-inline-code font-mono">components/admin/DynamicForm.tsx</span>.</li>
          <li>For auth changes, inspect <span className="docs-inline-code font-mono">lib/auth.ts</span>, <span className="docs-inline-code font-mono">lib/admins.ts</span>, and the register/login pages under <span className="docs-inline-code font-mono">app/admin/</span>.</li>
        </ul>
      </section>
    </div>
  );
}