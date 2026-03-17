import { prisma } from "@/lib/prisma";
// import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CVDownload from "@/components/CVDownload";
import Projects from "@/components/Projects";
import Footer from "@/components/Footer";
import type { CvType } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [profile, projects, rawCvs] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.project.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
    prisma.cv.findMany(),
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
        <Projects projects={projects} />
      </main>
      <Footer />
    </>
  );
}
