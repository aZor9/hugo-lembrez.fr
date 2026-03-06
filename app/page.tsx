import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CVDownload from "@/components/CVDownload";
import Projects from "@/components/Projects";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [profile, projects, cv] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.project.findMany({ orderBy: { order: "asc" } }),
    prisma.cv.findFirst({ orderBy: { updatedAt: "desc" } }),
  ]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Hero profile={profile} cv={cv} />
        <CVDownload cv={cv} />
        <Projects projects={projects} />
      </main>
      <Footer />
    </>
  );
}
