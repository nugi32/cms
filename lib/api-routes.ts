/**
 * The generic /api/<collection> and /api/<collection>/<id> routes cover
 * basic reads for every collection automatically. When you need something
 * more specific — a filtered feed, a computed field, combining two
 * collections — add a plain Next.js route file anywhere under app/api/,
 * same as any Next.js project (Next.js matches more specific static paths
 * before the generic dynamic ones, so e.g. app/api/posts/featured/route.ts
 * "wins" over app/api/[collection]/[id]/route.ts for that URL).
 *
 * List it here too so it shows up in the /admin/api-routes reference page —
 * purely documentation, has no effect on routing.
 */
export interface CustomApiRoute {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
}

export const customApiRoutes: CustomApiRoute[] = [
  {
    method: "GET",
    path: "/api/posts/featured",
    description:
      "Posts with featured=true — example of a hand-written route living " +
      "next to the generic collection routes (see app/api/posts/featured/route.ts).",
  },

  {
    method: "GET",
    path: "/api/test",
    description:
      "Test route for demonstration purposes.",
  },

  // Add your own here as you create new route files, e.g.:
  // {
  //   method: "GET",
  //   path: "/api/posts/recent",
  //   description: "Most recent 5 published posts.",
  // },
];
