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
  const { name } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Nom de catégorie requis" }, { status: 400 });
  }

  const category = await prisma.stackCategory.update({
    where: { id: params.id },
    data: { name: name.trim() },
  });

  revalidatePath("/");
  return NextResponse.json(category);
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

  const category = await prisma.stackCategory.update({
    where: { id: params.id },
    data: { visible },
  });

  revalidatePath("/");
  return NextResponse.json(category);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await prisma.stackCategory.delete({
    where: { id: params.id },
  });

  revalidatePath("/");
  return NextResponse.json({ success: true });
}
