import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/upload";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo

async function processImage(file: File, cropData?: string): Promise<Buffer> {
  const bytes = await file.arrayBuffer();
  let pipeline = sharp(Buffer.from(bytes));

  // Si des données de recadrage sont fournies (JSON: {x, y, width, height})
  if (cropData) {
    try {
      const crop = JSON.parse(cropData);
      if (crop.x != null && crop.y != null && crop.width && crop.height) {
        pipeline = pipeline.extract({
          left: Math.round(crop.x),
          top: Math.round(crop.y),
          width: Math.round(crop.width),
          height: Math.round(crop.height),
        });
      }
    } catch {
      // Pas de crop, on continue
    }
  }

  // Redimensionner en carré 512x512 et convertir en webp
  return pipeline
    .resize(512, 512, { fit: "cover", position: "center" })
    .webp({ quality: 85 })
    .toBuffer();
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const cropData = formData.get("crop") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format accepté : JPG, PNG, WebP ou SVG" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Taille maximale : 5 Mo" },
        { status: 400 }
      );
    }

    const processedBuffer = await processImage(file, cropData || undefined);

    let imageUrl: string;

    if (isBlobConfigured()) {
      const { put } = await import("@vercel/blob");
      const blob = await put(`images/profile-${Date.now()}.webp`, processedBuffer, {
        access: "public",
        addRandomSuffix: true,
        contentType: "image/webp",
      });
      imageUrl = blob.url;
    } else {
      const fileName = `profile-${Date.now()}.webp`;
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      await fs.writeFile(path.join(uploadsDir, fileName), processedBuffer);
      imageUrl = `/uploads/${fileName}`;
    }

    let profile = await prisma.profile.findFirst();

    if (profile) {
      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: { imageUrl },
      });
    } else {
      profile = await prisma.profile.create({
        data: {
          name: "Hugo Lembrez",
          title: "Développeur Full-Stack",
          bio: "",
          imageUrl,
        },
      });
    }

    revalidatePath("/");

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Erreur upload image:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement de l'image" },
      { status: 500 }
    );
  }
}
