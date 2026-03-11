import { prisma } from "@/lib/prisma";
import type { LinkType } from "@/types";

export const dynamic = "force-dynamic";

export default async function LinksPage() {
  const [links, profile] = await Promise.all([
    prisma.link.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
    }),
    prisma.profile.findFirst(),
  ]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-4">
        
        {/* En-tête */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">
            <a href="/" className="gradient-text">
              {profile?.name || "Hugo Lembrez"}
            </a>
          </h1>
          <p className="text-gray-400 text-sm">
            {profile?.title || "Développeur Full-Stack"}
          </p>
        </div>

        {/* Liens */}
        {links.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">Aucun lien disponible.</p>
        ) : (
          links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 w-full px-5 py-4 glass glass-hover rounded-2xl transition-all hover:scale-[1.02]"
            >
              {link.icon && (
                <span className="text-2xl shrink-0">{link.icon}</span>
              )}
              <div className="flex-grow min-w-0">
                <p className="font-semibold text-white group-hover:gradient-text transition-all">
                  {link.name}
                </p>
                {link.description && (
                  <p className="text-sm text-gray-400 truncate">{link.description}</p>
                )}
              </div>
              <svg
                className="w-4 h-4 text-gray-500 group-hover:text-white shrink-0 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          ))
        )}

        {/* Footer minimal */}
        <p className="text-center text-gray-600 text-xs pt-8">
          <a href="/" >© {new Date().getFullYear()} Hugo Lembrez </a>
        </p>
      </div>
    </main>
  );
}
