"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import CVUpload from "@/components/admin/CVUpload";
import ProjectManager from "@/components/admin/ProjectManager";
import ProfileManager from "@/components/admin/ProfileManager";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"cv" | "profile" | "projects">(
    "cv"
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    router.push("/login");
    return null;
  }

  const tabs = [
    { id: "cv" as const, label: "📄 CV", icon: "CV" },
    { id: "profile" as const, label: "👤 Profil", icon: "Profil" },
    { id: "projects" as const, label: "🚀 Projets", icon: "Projets" },
  ];

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
            Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block"
            >
              Voir le site
            </a>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
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
        <div className="glass p-4 sm:p-6">
          {activeTab === "cv" && <CVUpload />}
          {activeTab === "profile" && <ProfileManager />}
          {activeTab === "projects" && <ProjectManager />}
        </div>
      </div>
    </main>
  );
}
