import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { techId, label, categoryId } = body;

  if (!techId || !label || !categoryId) {
    return NextResponse.json(
      { error: "techId, label et categoryId sont requis" },
      { status: 400 }
    );
  }

  const existing = await prisma.stackItem.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Élément introuvable" }, { status: 404 });
  }

  let nextOrder: number | undefined;
  if (existing.categoryId !== categoryId) {
    const maxOrder = await prisma.stackItem.aggregate({
      where: { categoryId },
      _max: { order: true },
    });
    nextOrder = (maxOrder._max.order ?? -1) + 1;
  }

  const item = await prisma.stackItem.update({
    where: { id: params.id },
    data: {
      techId,
      label: label.trim(),
      categoryId,
      order: typeof nextOrder === "number" ? nextOrder : undefined,
    },
  });

  revalidatePath("/");
  return NextResponse.json(item);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { visible } = body;

  if (typeof visible !== "boolean") {
    return NextResponse.json({ error: "visible (boolean) requis" }, { status: 400 });
  }

  const item = await prisma.stackItem.update({
    where: { id: params.id },
    data: { visible },
  });

  revalidatePath("/");
  return NextResponse.json(item);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await prisma.stackItem.delete({
    where: { id: params.id },
  });

  revalidatePath("/");
  return NextResponse.json({ success: true });
}
