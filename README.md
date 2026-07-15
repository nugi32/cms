# Schema-driven Headless CMS (Next.js 16 + MongoDB)

Sanity/Strapi-style: an authenticated admin ("studio") for editing content,
a read-only REST API, and a public website — all driven by one schema file.
User accounts, auth, and light/dark theming are all built in.

## How it works

You edit **only** `lib/schemas.ts`. Everything else reads that file at
runtime and follows automatically:

- **Admin sidebar** — one link per collection
- **Admin list page** (`/admin/[collection]`) — table columns from the first 4 fields
- **Admin create / edit forms** — rendered field-by-field by `DynamicForm.tsx`
- **Public site** (`/`, `/[collection]`, `/[collection]/[slug]`) — index +
  detail pages, fetched from the API
- **REST API** (`/api/[collection]`, `/api/[collection]/[id]`) — **GET only**
- **Login / register** — shown automatically for anyone hitting `/admin`
  without a session

Add a new collection or field → it's live in the admin, the public site,
and the API. No other file needs to change.

## Setup

1. Copy these files into your fresh `create-next-app` project (App Router).
   This **replaces** `app/layout.tsx` and `app/globals.css`, adds
   `middleware.ts` at the project root, and adds `lib/`, `app/api/`,
   `app/admin/`, `app/(site)/`, `components/`, `scripts/`.
2. Install dependencies:
   ```bash
   npm install mongodb next-auth@beta bcryptjs
   npm install -D dotenv
   ```
3. Copy `.env.local.example` to `.env.local` and fill in:
   - `MONGODB_URI` / `MONGODB_DB`
   - `AUTH_SECRET` — generate with `npx auth secret`
   - `GITHUB_ID` / `GITHUB_SECRET` — see [Auth setup](#auth-setup) below
4. Make sure Tailwind CSS is enabled (default in `create-next-app`);
   `globals.css` assumes Tailwind v4 (`@import "tailwindcss"`) — see the
   comment at the top of that file if your project is on v3.
5. Run the app:
   ```bash
   npm run dev
   ```
6. Visit `/admin` — you'll land on `/admin/login`, which (since no admin
   exists yet) links to **"Create the first admin account"**. Register
   there with an email + password, or just click "Continue with GitHub" —
   either one becomes the first admin automatically.

## Auth setup — no env whitelist, accounts live in MongoDB

There's no `ALLOWED_ADMIN_EMAILS` env var. Instead:

- **First run (bootstrap):** while the `admins` collection in MongoDB is
  empty, `/admin/register` is open — whoever signs up there (email +
  password) becomes the first admin. Signing in with GitHub while the
  collection is still empty works the same way and creates the first
  admin from your GitHub email.
- **After that:** `/admin/register` redirects to `/admin/login` — it's
  bootstrap-only, not an open sign-up page. New users are added from
  **`/admin/users`** (in the sidebar under "Account") by an existing admin,
  either with a password (email + password login) or without one
  (GitHub-only — they sign in with that exact email via OAuth).
- **Both sign-in methods check the same source of truth**: `lib/auth.ts`'s
  `signIn` callback only lets a GitHub login through if that email already
  has an admin record (or it's still the bootstrap case) — a GitHub
  account alone is never enough.

GitHub OAuth app setup ([github.com/settings/developers](https://github.com/settings/developers)):
- Homepage URL: `http://localhost:3000` (or your real domain)
- Callback URL: `http://localhost:3000/api/auth/callback/github`

Put the client ID/secret in `GITHUB_ID` / `GITHUB_SECRET`.

How it's wired:
- `lib/admins.ts` — all user CRUD against the `admins` MongoDB collection
  (create with/without password, find, list, delete, count)
- `lib/auth.ts` — NextAuth (Auth.js v5) config: Credentials + GitHub
  providers, bootstrap + existing-user check in the `signIn` callback
- `middleware.ts` — redirects unauthenticated visits to `/admin/**`
  (except `/admin/login` and `/admin/register`) to the login page
- `app/admin/register/` — bootstrap-only registration (page + its own
  server action, since it needs to sign the new user in immediately)
- `app/admin/(dashboard)/users/page.tsx` — add/remove admins once you're
  signed in; this is the ongoing way to grant access, not the register page
- `scripts/create-admin.mjs` — optional CLI alternative (useful if you're
  locked out, or for scripting/CI)

## Light / dark mode

A toggle button (top-right of both the public site header and the admin
topbar) flips a `data-theme` attribute on `<html>`, persisted to
`localStorage`. `app/layout.tsx` includes a small inline script that reads
the saved preference (or the OS setting, on first visit) before paint, so
there's no flash of the wrong theme.

All colors are CSS variables in `app/globals.css` — `:root` holds the light
values, `[data-theme="dark"]` overrides them. Every component (admin and
public site) is built on these variables, so extending the palette or
adjusting a shade means editing variables in one place, not hunting through
components.

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

Save — "Authors" appears in the admin sidebar with a full list/create/edit
UI, a public `/authors` page, and `/api/authors` endpoints. No other code
needed.

## Supported field types

`text`, `textarea`, `richtext`, `number`, `boolean`, `date`, `select`
(needs `options: string[]`), `image` (stores a URL), `relation` (needs
`relationTo: "<collectionName>"`, optionally `titleField`).

To add a brand-new field type, touch two spots: the `renderField` switch in
`components/admin/DynamicForm.tsx`, and `validateAndCoerce` in
`lib/cms-service.ts`.

## API routes: generic + custom, side by side

Every collection automatically gets:

```
GET /api/posts                  -> { data: [...] }
GET /api/posts?status=published -> { data: [...] }   (equality filter, any field)
GET /api/posts?slug=my-post     -> { data: [...] }
GET /api/posts/:id              -> { data: {...} }
```

No write methods exist on these — see `app/api/[collection]/route.ts`.
Writes only happen through the admin's server actions
(`app/admin/actions.ts`), which call `lib/cms-service.ts` directly against
MongoDB, never over HTTP.

**To add your own route**, just add a normal Next.js route file:

```ts
// app/api/posts/featured/route.ts
import { NextResponse } from "next/server";
import { listItems } from "@/lib/cms-service";

export async function GET() {
  const items = await listItems("posts", { featured: "true" });
  return NextResponse.json({ data: items });
}
```

Next.js matches this static path before the generic dynamic one
(`/api/[collection]/[id]`), so it works with no registration step. This
exact example is included at that path. Optionally list it in
`lib/api-routes.ts` so it shows up on the **`/admin/api-routes`** reference
page in the studio.

## Next steps / things you'll likely want to add

- **Image upload** instead of pasting URLs (e.g. UploadThing, S3, Cloudinary)
- **Rich text editor** (TipTap, Lexical) swapped into the `richtext` case
- **Pagination** in `listItems` for large collections
- **Password reset / "forgot password"** flow — not included; today a
  locked-out user needs another admin (or `scripts/create-admin.mjs`) to help
- **Rate limiting** on the public API if it gets real traffic
- **Roles** (e.g. editor vs admin) if you need more than one access tier
