import { NextRequest, NextResponse } from "next/server";
import { listItems } from "@/lib/cms-service";
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
 * A hand-written route (as opposed to the generic /api/[collection] one).
 * This is the pattern to copy whenever you need something the generic
 * routes don't cover: create a folder/route.ts under app/api/ and query
 * lib/cms-service.ts however you need.
 */
export async function GET(request: NextRequest) {
  const items = await listItems("posts", { featured: "true" });
  const response = NextResponse.json({ data: items });
  return applyCorsHeaders(request, response);
}

export async function OPTIONS(request: NextRequest) {
  return applyCorsHeaders(request, new NextResponse(null, { status: 204 }));
}
