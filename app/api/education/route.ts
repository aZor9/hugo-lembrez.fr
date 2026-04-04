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

  const items = await prisma.educationItem.findMany({
    where: all ? undefined : { visible: true },
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
  const { title, school, period, statusLabel, description } = body;

  if (!title || !school || !period) {
    return NextResponse.json(
      { error: "title, school et period sont requis" },
      { status: 400 }
    );
  }

  const maxOrder = await prisma.educationItem.aggregate({ _max: { order: true } });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  const item = await prisma.educationItem.create({
    data: {
      title: title.trim(),
      school: school.trim(),
      period: period.trim(),
      statusLabel: statusLabel ? String(statusLabel).trim() : null,
      description: description ? String(description).trim() : null,
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
      prisma.educationItem.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/");
  return NextResponse.json({ success: true });
}

