import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/upload";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

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

function buildStorageFileName(baseName: string): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");

  const slug = slugifyFileName(baseName) || "cv";
  return `${slug}-${yyyy}${mm}${dd}-${hh}${min}.pdf`;
}

function buildPublicFileName(fileName: string): string {
  const slug = slugifyFileName(fileName) || "cv";
  return `${slug}.pdf`;
}

export async function GET() {
  const cv = await prisma.cv.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(cv);
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { fileName } = await request.json();
    if (!fileName || typeof fileName !== "string") {
      return NextResponse.json({ error: "Nom de fichier requis" }, { status: 400 });
    }

    const sanitized = buildPublicFileName(fileName);
    if (!sanitized || sanitized === ".pdf") {
      return NextResponse.json({ error: "Nom de fichier invalide" }, { status: 400 });
    }

    const cv = await prisma.cv.findFirst({ orderBy: { updatedAt: "desc" } });
    if (!cv) {
      return NextResponse.json({ error: "Aucun CV trouvé" }, { status: 404 });
    }

    const updated = await prisma.cv.update({
      where: { id: cv.id },
      data: { fileName: sanitized },
    });

    revalidatePath("/");
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur renommage CV:", error);
    return NextResponse.json({ error: "Erreur lors du renommage" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Un fichier PDF est requis" },
        { status: 400 }
      );
    }

    const publicFileName = buildPublicFileName(file.name);
    const storageFileName = buildStorageFileName(file.name);

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

    await prisma.cv.deleteMany();

    const cv = await prisma.cv.create({
      data: {
        fileUrl,
        fileName: publicFileName,
      },
    });

    revalidatePath("/");

    return NextResponse.json(cv);
  } catch (error) {
    console.error("Erreur upload CV:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du CV" },
      { status: 500 }
    );
  }
}
