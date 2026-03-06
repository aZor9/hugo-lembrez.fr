import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await prisma.profile.findFirst();
  return NextResponse.json(profile);
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { name, title, bio } = body;

  if (!name || !title || !bio) {
    return NextResponse.json(
      { error: "Nom, titre et bio requis" },
      { status: 400 }
    );
  }

  let profile = await prisma.profile.findFirst();

  if (profile) {
    profile = await prisma.profile.update({
      where: { id: profile.id },
      data: { name, title, bio },
    });
  } else {
    profile = await prisma.profile.create({
      data: { name, title, bio },
    });
  }

  revalidatePath("/");

  return NextResponse.json(profile);
}
