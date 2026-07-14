# Schema-driven Headless CMS (Next.js 16 + MongoDB)

Sanity/Strapi-style: an admin ("studio") for editing content, a read-only
REST API, and a public website that renders whatever is in the database —
all driven by one schema file.

## How it works

You edit **only** `lib/schemas.ts`. Everything else reads that file at
runtime and follows automatically:

- **Admin sidebar** (`components/admin/Sidebar.tsx`) — one link per collection
- **Admin list page** (`/admin/[collection]`) — table columns from the first 4 fields
- **Admin create / edit forms** (`/admin/[collection]/new`, `/admin/[collection]/[id]`)
  — rendered field-by-field by `DynamicForm.tsx` based on each field's `type`
- **Public site** (`/`, `/[collection]`, `/[collection]/[slug]`) — a
  chronological index + detail pages, fetched from the API, working for any
  collection you define
- **REST API** (`/api/[collection]`, `/api/[collection]/[id]`) — **read-only
  (GET only)**, validated against the same schema

Add a new collection or field → it's live in the admin, the public site,
and the API. No other file needs to change.

## Architecture: why the API is GET-only

- `/api/*` routes only export `GET`. There's no `POST`/`PUT`/`DELETE` on
  them at all — that's not a permissions check, the handlers simply don't
  exist, so there's nothing to accidentally expose.
- Writes happen through **server actions** (`app/admin/actions.ts`), which
  call `lib/cms-service.ts` directly against MongoDB — they never go
  through HTTP. That's how the admin creates/updates/deletes without a
  public write endpoint existing anywhere.
- The public site (`app/(site)/...`) fetches its data through `lib/api.ts`,
  which calls your own `/api/<collection>` routes with `fetch`, same as an
  external consumer would. That's a real client of the read-only API, not a
  shortcut into the database.
- `/api/<collection>` supports simple equality filters via query params,
  e.g. `/api/posts?status=published` or `/api/posts?slug=my-post` (used by
  the detail pages to resolve slugs).

If you later need authenticated writes from an external client, add a new
route deliberately (e.g. `/api/[collection]/route.ts` → `POST`, gated by an
API key or session check) rather than reopening the public one.

## Setup

1. Copy these files into your fresh `create-next-app` project (App Router),
   keeping the folder structure — this **replaces** your project's
   `app/layout.tsx` and `app/globals.css` (it adds fonts + design tokens),
   and adds `lib/`, `app/api/`, `app/admin/`, `app/(site)/`, `components/`.
2. Install the MongoDB driver:
   ```bash
   npm install mongodb
   ```
3. Copy `.env.local.example` to `.env.local` and fill in your MongoDB
   connection string (Atlas free tier works fine, or a local `mongodb://localhost:27017`).
4. Make sure Tailwind CSS is enabled (default in `create-next-app`) — the
   admin UI uses Tailwind utility classes; `globals.css` assumes Tailwind v4
   (`@import "tailwindcss"`) — see the comment at the top of that file if
   your project is on v3.
5. Run the app:
   ```bash
   npm run dev
   ```
6. Visit `/` for the public site, and `/admin` for the studio. "Posts" and
   "Categories" are already defined in `lib/schemas.ts` as an example —
   add an entry from `/admin/posts/new` and it appears on `/` and
   `/posts` immediately (content revalidates every 30s, or instantly after
   an admin edit via `revalidatePath`).

## Adding a new collection

Open `lib/schemas.ts` and add an entry, e.g.:

```ts
{
  name: "authors",
  label: "Authors",
  fields: [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "bio", label: "Bio", type: "textarea" },
  ],
},
```

Save the file — refresh `/admin` and "Authors" appears in the sidebar with
a full working list/create/edit UI and `/api/authors` endpoints, no other
code needed.

## Supported field types

`text`, `textarea`, `richtext`, `number`, `boolean`, `date`, `select`
(needs `options: string[]`), `image` (stores a URL), `relation` (needs
`relationTo: "<collectionName>"`, optionally `titleField`).

To add a brand-new field type (e.g. a real rich-text editor, a file
upload, a multi-select), you only need to touch two spots:

- `FieldType` union + rendering in `components/admin/DynamicForm.tsx` (`renderField`)
- Coercion/validation logic in `lib/cms-service.ts` (`validateAndCoerce`)

## Consuming the API from any frontend

```
GET /api/posts                 -> { data: [...] }
GET /api/posts?status=published -> { data: [...] }  (equality filter on any field)
GET /api/posts?slug=my-post     -> { data: [...matching...] }
GET /api/posts/:id              -> { data: {...} }
```

No write methods exist on these routes. This is intentionally public and
unauthenticated for local development since it's read-only. **Before
deploying**, still add auth to `/admin/*` and its server actions (e.g.
NextAuth, Clerk, or a simple password check in `app/admin/layout.tsx`) —
see the "Next steps" note below.

## Next steps / things you'll likely want to add

- **Auth** for `/admin/*` and write endpoints (NextAuth, Clerk, or a simple
  password-protected middleware)
- **Image upload** instead of pasting URLs (e.g. UploadThing, S3, Cloudinary)
- **Rich text editor** (TipTap, Lexical) swapped into the `richtext` case
- **Pagination** in `listItems` for large collections
- **Indexes** in MongoDB for fields you filter/sort by often
