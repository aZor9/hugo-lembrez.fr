import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getOrCreateHomeSectionSettings } from "@/lib/home-settings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getOrCreateHomeSectionSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await request.json();
  const {
    stacksVisible,
    stacksTitle,
    educationVisible,
    educationTitle,
    educationLeadVisible,
    educationLeadTitle,
    educationLeadSubtitle,
  } = body;

  const settings = await getOrCreateHomeSectionSettings();

  const updated = await prisma.homeSectionSettings.update({
    where: { id: settings.id },
    data: {
      stacksVisible: typeof stacksVisible === "boolean" ? stacksVisible : undefined,
      stacksTitle: typeof stacksTitle === "string" ? stacksTitle.trim() : undefined,
      educationVisible: typeof educationVisible === "boolean" ? educationVisible : undefined,
      educationTitle: typeof educationTitle === "string" ? educationTitle.trim() : undefined,
      educationLeadVisible:
        typeof educationLeadVisible === "boolean" ? educationLeadVisible : undefined,
      educationLeadTitle:
        typeof educationLeadTitle === "string" ? educationLeadTitle.trim() : undefined,
      educationLeadSubtitle:
        typeof educationLeadSubtitle === "string"
          ? educationLeadSubtitle.trim()
          : undefined,
    },
  });

  revalidatePath("/");
  return NextResponse.json(updated);
}

