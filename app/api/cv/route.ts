import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildPublicFileName,
  buildStorageFileName,
  CV_VARIANTS,
  getCvRoutePath,
  isCvVariant,
} from "@/lib/cv";
import { isBlobConfigured } from "@/lib/upload";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

interface StoredCv {
  id: string;
  variant: string;
  fileUrl: string;
  fileName: string;
  updatedAt: Date;
}

function sortVariantOrder(a: { variant: string }, b: { variant: string }) {
  return CV_VARIANTS.indexOf(a.variant as (typeof CV_VARIANTS)[number]) -
    CV_VARIANTS.indexOf(b.variant as (typeof CV_VARIANTS)[number]);
}

export async function GET(request: NextRequest) {
  const variant = request.nextUrl.searchParams.get("variant");

  if (variant) {
    if (!isCvVariant(variant)) {
      return NextResponse.json({ error: "Type de CV invalide" }, { status: 400 });
    }

    const cv = (await (prisma.cv.findFirst as any)({
      where: { variant },
    })) as StoredCv | null;

    if (!cv) {
      return NextResponse.json({ error: "CV introuvable" }, { status: 404 });
    }

    return NextResponse.json(cv);
  }

  const cvs = (await prisma.cv.findMany()) as StoredCv[];
  return NextResponse.json(cvs.sort(sortVariantOrder));
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { id, fileName } = await request.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Identifiant requis" }, { status: 400 });
    }

    if (!fileName || typeof fileName !== "string") {
      return NextResponse.json({ error: "Nom de fichier requis" }, { status: 400 });
    }

    const cv = (await prisma.cv.findUnique({ where: { id } })) as StoredCv | null;
    if (!cv || !isCvVariant(cv.variant)) {
      return NextResponse.json({ error: "CV introuvable" }, { status: 404 });
    }

    const sanitized = buildPublicFileName(fileName, cv.variant);
    if (!sanitized || sanitized === ".pdf") {
      return NextResponse.json({ error: "Nom de fichier invalide" }, { status: 400 });
    }

    const updated = await prisma.cv.update({
      where: { id },
      data: { fileName: sanitized },
    });

    revalidatePath("/");
    revalidatePath(getCvRoutePath(cv.variant));
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur renommage CV:", error);
    return NextResponse.json({ error: "Erreur lors du renommage" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const variantValue = formData.get("variant");

    if (!variantValue || typeof variantValue !== "string" || !isCvVariant(variantValue)) {
      return NextResponse.json({ error: "Type de CV invalide" }, { status: 400 });
    }

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Un fichier PDF est requis" },
        { status: 400 }
      );
    }

    const publicFileName = buildPublicFileName(file.name, variantValue);
    const storageFileName = buildStorageFileName(file.name, variantValue);

    let fileUrl: string;

    if (isBlobConfigured()) {
      const { put } = await import("@vercel/blob");
      const blob = await put(`cv/${storageFileName}`, file, {
        access: "public",
        addRandomSuffix: false,
      });
      fileUrl = blob.url;
    } else {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      await fs.writeFile(path.join(uploadsDir, storageFileName), buffer);
      fileUrl = `/uploads/${storageFileName}`;
    }

    const existingCv = (await (prisma.cv.findFirst as any)({
      where: { variant: variantValue },
    })) as StoredCv | null;

    const cv = existingCv
      ? await prisma.cv.update({
          where: { id: existingCv.id },
          data: {
            fileUrl,
            fileName: publicFileName,
          },
        })
      : await (prisma.cv.create as any)({
          data: {
            variant: variantValue,
            fileUrl,
            fileName: publicFileName,
          },
        });

    revalidatePath("/");
    revalidatePath(getCvRoutePath(variantValue));

    return NextResponse.json(cv);
  } catch (error) {
    console.error("Erreur upload CV:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du CV" },
      { status: 500 }
    );
  }
}

