import { NextResponse } from "next/server";
import {
  addAllowedOrigin,
  getAllowedOrigins,
  isOriginAllowed,
  removeAllowedOrigin,
} from "@/lib/cors";

function withCorsHeaders(origin: string | null, response: NextResponse) {
  if (!origin || !isOriginAllowed(origin)) {
    return response;
  }

  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Vary", "Origin");
  return response;
}

function withCorsPreflightHeaders(origin: string | null, response: NextResponse) {
  if (!origin || !isOriginAllowed(origin)) {
    return response;
  }

  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Vary", "Origin");
  return response;
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  return withCorsHeaders(origin, NextResponse.json({ origins: getAllowedOrigins() }));
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const body = await request.json().catch(() => ({}));
  const candidate = typeof body?.origin === "string" ? body.origin : "";

  try {
    const origins = addAllowedOrigin(candidate);
    return withCorsHeaders(
      origin,
      NextResponse.json({ origins, success: true })
    );
  } catch (error) {
    return withCorsHeaders(
      origin,
      NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Unable to save origin.",
        },
        { status: 400 }
      )
    );
  }
}

export async function DELETE(request: Request) {
  const origin = request.headers.get("origin");
  const body = await request.json().catch(() => ({}));
  const candidate = typeof body?.origin === "string" ? body.origin : "";

  try {
    const origins = removeAllowedOrigin(candidate);
    return withCorsHeaders(
      origin,
      NextResponse.json({ origins, success: true })
    );
  } catch (error) {
    return withCorsHeaders(
      origin,
      NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Unable to remove origin.",
        },
        { status: 400 }
      )
    );
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  const response = new NextResponse(null, { status: 204 });
  return withCorsPreflightHeaders(origin, response);
}
