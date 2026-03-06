import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/upload";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

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

    const sanitized = fileName.replace(/[^a-zA-Z0-9À-ÿ _\-().]/g, "").trim();
    if (!sanitized) {
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

    let fileUrl: string;

    if (isBlobConfigured()) {
      const { put } = await import("@vercel/blob");
      const blob = await put(`cv/${file.name}`, file, {
        access: "public",
        addRandomSuffix: true,
      });
      fileUrl = blob.url;
    } else {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `cv-${Date.now()}.pdf`;
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      await fs.writeFile(path.join(uploadsDir, fileName), buffer);
      fileUrl = `/uploads/${fileName}`;
    }

    await prisma.cv.deleteMany();

    const cv = await prisma.cv.create({
      data: {
        fileUrl,
        fileName: file.name,
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
