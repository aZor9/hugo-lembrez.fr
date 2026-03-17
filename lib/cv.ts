import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export const CV_VARIANTS = ["normal", "reduit"] as const;

export type CvVariant = (typeof CV_VARIANTS)[number];

interface StoredCv {
  id: string;
  variant: string;
  fileUrl: string;
  fileName: string;
  updatedAt: Date;
}

export function isCvVariant(value: string): value is CvVariant {
  return CV_VARIANTS.includes(value as CvVariant);
}

export function getCvRoutePath(variant: CvVariant): string {
  return variant === "reduit" ? "/CV-leger" : "/CV";
}

export function getCvLabel(variant: CvVariant): string {
  return variant === "reduit" ? "CV léger" : "CV principal";
}

function removePdfExtension(fileName: string): string {
  return fileName.replace(/\.pdf$/i, "");
}

function slugifyFileName(fileName: string): string {
  return removePdfExtension(fileName)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureVariantInSlug(slug: string, variant: CvVariant): string {
  if (variant === "normal") {
    return slug || "cv";
  }

  if (/(leger|reduit|aplati)$/.test(slug)) {
    return slug;
  }

  return `${slug || "cv"}-leger`;
}

export function buildPublicFileName(fileName: string, variant: CvVariant): string {
  const slug = ensureVariantInSlug(slugifyFileName(fileName), variant);
  return `${slug}.pdf`;
}

export function buildStorageFileName(fileName: string, variant: CvVariant): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const slug = ensureVariantInSlug(slugifyFileName(fileName), variant);

  return `${slug}-${yyyy}${mm}${dd}-${hh}${min}.pdf`;
}

function contentDisposition(fileName: string, asAttachment: boolean): string {
  const type = asAttachment ? "attachment" : "inline";
  return `${type}; filename="${fileName}"`;
}

export async function serveCvVariant(
  request: NextRequest,
  variant: CvVariant,
  routePath: string
) {
  const cv = (await (prisma.cv.findFirst as any)({
    where: { variant },
  })) as StoredCv | null;

  if (!cv) {
    return NextResponse.json({ error: `Aucun ${getCvLabel(variant)} trouvé` }, { status: 404 });
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
      return NextResponse.json({ error: `Impossible de récupérer le fichier ${routePath}` }, { status: 502 });
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
    console.error(`Erreur récupération ${routePath}:`, error);
    return NextResponse.json({ error: "Erreur lors de la récupération du CV" }, { status: 500 });
  }
}
