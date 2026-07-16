import { NextResponse } from "next/server";
import { listItems } from "@/lib/cms-service";

export async function GET() {
  const items = await listItems("test", { featured: "true" });
  return NextResponse.json({ data: items });
}