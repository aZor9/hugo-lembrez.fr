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
  const { title, description, link, tags } = body;

  if (!title || !description) {
    return NextResponse.json(
      { error: "Titre et description requis" },
      { status: 400 }
    );
  }

  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      title,
      description,
      link: link || null,
      tags: JSON.stringify(Array.isArray(tags) ? tags : []),
    },
  });

  revalidatePath("/");

  return NextResponse.json(project);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await prisma.project.delete({
    where: { id: params.id },
  });

  revalidatePath("/");

  return NextResponse.json({ success: true });
}
