import { NextRequest } from "next/server";
import { serveCvVariant } from "@/lib/cv";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return serveCvVariant(request, "reduit", "/CV-leger");
}
