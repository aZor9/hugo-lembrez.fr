import { prisma } from "@/lib/prisma";

export async function getOrCreateHomeSectionSettings() {
  const existing = await prisma.homeSectionSettings.findUnique({
    where: { key: "home" },
  });

  if (existing) {
    return existing;
  }

  return prisma.homeSectionSettings.create({
    data: { key: "home" },
  });
}
