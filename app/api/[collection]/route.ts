import { NextRequest, NextResponse } from "next/server";
import { listItems, getSchema } from "@/lib/cms-service";
import { isOriginAllowed } from "@/lib/cors";

function applyCorsHeaders(req: NextRequest, response: NextResponse) {
  const origin = req.headers.get("origin");
  if (!origin || !isOriginAllowed(origin)) {
    return response;
  }

  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Vary", "Origin");
  return response;
}

/**
 * Public read-only API: GET /api/<collection>
 * Supports simple equality filters via query params, e.g.
 *   /api/posts?status=published
 *   /api/posts?slug=my-first-post
 *
 * This route only exports GET — there is no POST here on purpose.
 * All writes go through the admin's server actions (app/admin/actions.ts),
 * which call lib/cms-service.ts directly. If you need write access from
 * an external client, add an authenticated route/action deliberately
 * rather than opening this one up.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection } = await params;
  try {
    getSchema(collection); // throws if unknown collection

    const filters: Record<string, string> = {};
    req.nextUrl.searchParams.forEach((value, key) => {
      filters[key] = value;
    });

    const items = await listItems(collection, filters);
    const response = NextResponse.json({ data: items });
    return applyCorsHeaders(req, response);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}

export async function OPTIONS(req: NextRequest) {
  return applyCorsHeaders(req, new NextResponse(null, { status: 204 }));
}
