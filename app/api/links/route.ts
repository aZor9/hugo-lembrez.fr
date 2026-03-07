import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "1";

  if (all) {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  }

  const links = await prisma.link.findMany({
    where: all ? undefined : { visible: true },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(links);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, icon, url } = body;

  if (!name || !url) {
    return NextResponse.json({ error: "Nom et URL requis" }, { status: 400 });
  }

  const maxOrder = await prisma.link.aggregate({ _max: { order: true } });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  const link = await prisma.link.create({
    data: {
      name,
      description: description || null,
      icon: icon || null,
      url,
      order: nextOrder,
    },
  });

  revalidatePath("/links");
  return NextResponse.json(link);
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { ids } = await request.json();
  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "ids requis" }, { status: 400 });
  }

  await Promise.all(
    ids.map((id: string, index: number) =>
      prisma.link.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/links");
  return NextResponse.json({ success: true });
}
