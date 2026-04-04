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
  const { title, school, period, statusLabel, description } = body;

  if (!title || !school || !period) {
    return NextResponse.json(
      { error: "title, school et period sont requis" },
      { status: 400 }
    );
  }

  const item = await prisma.educationItem.update({
    where: { id: params.id },
    data: {
      title: title.trim(),
      school: school.trim(),
      period: period.trim(),
      statusLabel: statusLabel ? String(statusLabel).trim() : null,
      description: description ? String(description).trim() : null,
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

  const item = await prisma.educationItem.update({
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

  await prisma.educationItem.delete({
    where: { id: params.id },
  });

  revalidatePath("/");
  return NextResponse.json({ success: true });
}
