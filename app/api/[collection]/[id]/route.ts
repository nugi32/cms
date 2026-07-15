import { NextRequest, NextResponse } from "next/server";
import { getItem, getSchema } from "@/lib/cms-service";
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
 * Public read-only API: GET /api/<collection>/<id>
 *
 * GET-only by design — see app/api/[collection]/route.ts for why.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  const { collection, id } = await params;
  try {
    getSchema(collection);
    const item = await getItem(collection, id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const response = NextResponse.json({ data: item });
    return applyCorsHeaders(req, response);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}

export async function OPTIONS(req: NextRequest) {
  return applyCorsHeaders(req, new NextResponse(null, { status: 204 }));
}
