import { NextRequest, NextResponse } from "next/server";
import { getItem, getSchema } from "@/lib/cms-service";

/**
 * Public read-only API: GET /api/<collection>/<id>
 *
 * GET-only by design — see app/api/[collection]/route.ts for why.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  const { collection, id } = await params;
  try {
    getSchema(collection);
    const item = await getItem(collection, id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: item });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
