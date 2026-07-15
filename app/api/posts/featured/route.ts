import { NextResponse } from "next/server";
import { listItems } from "@/lib/cms-service";

/**
 * A hand-written route (as opposed to the generic /api/[collection] one).
 * This is the pattern to copy whenever you need something the generic
 * routes don't cover: create a folder/route.ts under app/api/ and query
 * lib/cms-service.ts however you need.
 */
export async function GET() {
  const items = await listItems("posts", { featured: "true" });
  return NextResponse.json({ data: items });
}
