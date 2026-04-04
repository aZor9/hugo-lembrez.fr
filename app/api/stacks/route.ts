import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "1";
  const categoryId = searchParams.get("categoryId") || undefined;

  if (all) {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }
  }

  const items = await prisma.stackItem.findMany({
    where: {
      ...(all ? {} : { visible: true }),
      ...(categoryId ? { categoryId } : {}),
    },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await request.json();
  const { techId, label, categoryId } = body;

  if (!techId || !label || !categoryId) {
    return NextResponse.json(
      { error: "techId, label et categoryId sont requis" },
      { status: 400 }
    );
  }

  const category = await prisma.stackCategory.findUnique({ where: { id: categoryId } });
  if (!category) {
    return NextResponse.json({ error: "Categorie introuvable" }, { status: 404 });
  }

  const maxOrder = await prisma.stackItem.aggregate({
    where: { categoryId },
    _max: { order: true },
  });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  const item = await prisma.stackItem.create({
    data: {
      techId,
      label: label.trim(),
      categoryId,
      order: nextOrder,
    },
  });

  revalidatePath("/");
  return NextResponse.json(item);
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { ids } = await request.json();
  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "ids requis" }, { status: 400 });
  }

  await Promise.all(
    ids.map((id: string, index: number) =>
      prisma.stackItem.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/");
  return NextResponse.json({ success: true });
}

