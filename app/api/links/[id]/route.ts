import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, icon, url } = body;

  if (!name || !url) {
    return NextResponse.json({ error: "Nom et URL requis" }, { status: 400 });
  }

  const link = await prisma.link.update({
    where: { id: params.id },
    data: {
      name,
      description: description || null,
      icon: icon || null,
      url,
    },
  });

  revalidatePath("/links");
  return NextResponse.json(link);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { visible } = body;

  if (typeof visible !== "boolean") {
    return NextResponse.json({ error: "visible (boolean) requis" }, { status: 400 });
  }

  const link = await prisma.link.update({
    where: { id: params.id },
    data: { visible },
  });

  revalidatePath("/links");
  return NextResponse.json(link);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await prisma.link.delete({ where: { id: params.id } });

  revalidatePath("/links");
  return NextResponse.json({ success: true });
}
