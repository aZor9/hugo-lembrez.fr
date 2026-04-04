import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const target = new URL(`/CV${request.nextUrl.search}`, request.url);
  return NextResponse.redirect(target, 307);
}

