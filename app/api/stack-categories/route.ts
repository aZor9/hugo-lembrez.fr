import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "1";

  if (all) {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }
  }

  const categories = await prisma.stackCategory.findMany({
    where: all ? undefined : { visible: true },
    orderBy: { order: "asc" },
    include: {
      items: {
        where: all ? undefined : { visible: true },
        orderBy: { order: "asc" },
      },
    },
  });

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Nom de categorie requis" }, { status: 400 });
  }

  const maxOrder = await prisma.stackCategory.aggregate({ _max: { order: true } });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  const category = await prisma.stackCategory.create({
    data: {
      name: name.trim(),
      order: nextOrder,
    },
  });

  revalidatePath("/");
  return NextResponse.json(category);
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
      prisma.stackCategory.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/");
  return NextResponse.json({ success: true });
}

