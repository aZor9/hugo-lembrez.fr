import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function contentDisposition(fileName: string, asAttachment: boolean): string {
  const type = asAttachment ? "attachment" : "inline";
  return `${type}; filename="${fileName}"`;
}

export async function GET(request: NextRequest) {
  const cv = await prisma.cv.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  if (!cv) {
    return NextResponse.json({ error: "Aucun CV trouvé" }, { status: 404 });
  }

  const asAttachment = request.nextUrl.searchParams.get("download") === "1";

  try {
    if (cv.fileUrl.startsWith("/uploads/")) {
      const absolutePath = path.join(process.cwd(), "public", cv.fileUrl);
      const buffer = await fs.readFile(absolutePath);

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": contentDisposition(cv.fileName, asAttachment),
          "Cache-Control": "no-store",
        },
      });
    }

    const upstream = await fetch(cv.fileUrl, { cache: "no-store" });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Impossible de récupérer le CV" }, { status: 502 });
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/pdf",
        "Content-Disposition": contentDisposition(cv.fileName, asAttachment),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Erreur récupération CV /CV:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération du CV" }, { status: 500 });
  }
}
