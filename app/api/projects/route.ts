import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, link, siteUrl, tags } = body;

  if (!title || !description) {
    return NextResponse.json(
      { error: "Titre et description requis" },
      { status: 400 }
    );
  }

  const maxOrder = await prisma.project.aggregate({ _max: { order: true } });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  const project = await prisma.project.create({
    data: {
      title,
      description,
      link: link || null,
      siteUrl: siteUrl || null,
      tags: JSON.stringify(Array.isArray(tags) ? tags : []),
      order: nextOrder,
    },
  });

  revalidatePath("/");

  return NextResponse.json(project);
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
      prisma.project.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/");
  return NextResponse.json({ success: true });
}

