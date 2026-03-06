import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, link, tags } = body;

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
      tags: JSON.stringify(Array.isArray(tags) ? tags : []),
      order: nextOrder,
    },
  });

  revalidatePath("/");

  return NextResponse.json(project);
}
