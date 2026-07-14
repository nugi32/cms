import { NextRequest, NextResponse } from "next/server";
import { listItems, getSchema } from "@/lib/cms-service";

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
    return NextResponse.json({ data: items });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
