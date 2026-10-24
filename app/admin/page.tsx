"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import CVUpload from "@/components/admin/CVUpload";
import ProjectManager from "@/components/admin/ProjectManager";
import ProfileManager from "@/components/admin/ProfileManager";
import LinkManager from "@/components/admin/LinkManager";
import StackManager from "@/components/admin/StackManager";
import EducationManager from "@/components/admin/EducationManager";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "cv" | "profile" | "projects" | "links" | "stacks" | "education"
  >(
    "cv"
  );

  const unauthenticated = status === "unauthenticated" || (status !== "loading" && !session);

  useEffect(() => {
    if (unauthenticated) router.push("/login");
  }, [unauthenticated, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (unauthenticated) return null;

  const tabs = [
    { id: "cv" as const, label: "📄 CV", icon: "CV" },
    { id: "profile" as const, label: "👤 Profil", icon: "Profil" },
    { id: "projects" as const, label: "🚀 Projets", icon: "Projets" },
    { id: "links" as const, label: "🔗 Liens", icon: "Liens" },
    { id: "stacks" as const, label: "🧰 Stacks", icon: "Stacks" },
    { id: "education" as const, label: "🎓 Formation", icon: "Formation" },
  ];

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen px-4 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
            Dashboard
          </h1>
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors py-2"
            >
              Voir le site
            </a>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-gray-400 hover:text-red-400 transition-colors py-2"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div
          role="tablist"
          aria-label="Sections de l'administration"
          className="sticky top-0 z-20 -mx-4 px-4 py-2 mb-6 sm:mb-8 flex gap-2 overflow-x-auto bg-slate-950/90 backdrop-blur sm:static sm:mx-0 sm:px-0 sm:bg-transparent sm:backdrop-blur-none"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 min-h-[44px] rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-300"
                  : "glass glass-hover text-gray-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div role="tabpanel" className="glass p-4 sm:p-6">
          {activeTab === "cv" && <CVUpload />}
          {activeTab === "profile" && <ProfileManager />}
          {activeTab === "projects" && <ProjectManager />}
          {activeTab === "links" && <LinkManager />}
          {activeTab === "stacks" && <StackManager />}
          {activeTab === "education" && <EducationManager />}
        </div>
      </div>
    </main>
  );
}
