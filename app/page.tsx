import { prisma } from "@/lib/prisma";
// import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CVDownload from "@/components/CVDownload";
import Projects from "@/components/Projects";
import TechStackSection from "@/components/TechStackSection";
import EducationSection from "@/components/EducationSection";
import Footer from "@/components/Footer";
import { getOrCreateHomeSectionSettings } from "@/lib/home-settings";
import type { CvType } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [profile, projects, rawCvs, stackCategories, educationItems, sectionSettings] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.project.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
    prisma.cv.findMany(),
    prisma.stackCategory.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
      include: {
        items: {
          where: { visible: true },
          orderBy: { order: "asc" },
        },
      },
    }),
    prisma.educationItem.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
    }),
    getOrCreateHomeSectionSettings(),
  ]);

  const cvs = rawCvs as CvType[];

  const normalCv = cvs.find((cv) => cv.variant === "normal") ?? null;
  const reducedCv = cvs.find((cv) => cv.variant === "reduit") ?? null;

  return (
    <>
      {/* <Navbar /> */}
      <main className="min-h-screen">
        <Hero profile={profile} cv={normalCv} />
        <CVDownload normalCv={normalCv} reducedCv={reducedCv} />
        {sectionSettings.educationVisible && (
          <EducationSection
            title={sectionSettings.educationTitle}
            leadVisible={sectionSettings.educationLeadVisible}
            leadTitle={sectionSettings.educationLeadTitle}
            leadSubtitle={sectionSettings.educationLeadSubtitle}
            items={educationItems}
          />
        )}
        <Projects projects={projects} />
        {sectionSettings.stacksVisible && (
          <TechStackSection
            title={sectionSettings.stacksTitle}
            categories={stackCategories}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
