import GlassCard from "./GlassCard";
import type { ProjectType } from "@/types";
import { getTechById } from "@/lib/tech-icons";

interface ProjectsProps {
  projects: ProjectType[];
}

export default function Projects({ projects }: ProjectsProps) {
  if (projects.length === 0) return null;

  return (
    <section id="projects" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          <span className="gradient-text">Mes Projets</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => {
            let tags: string[] = [];
            try { tags = JSON.parse(project.tags || "[]"); } catch { /* ignore */ }

            return (
              <div
                key={project.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <GlassCard hover className="h-full flex flex-col">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {project.title}
                  </h3>
                  <p className="text-gray-400 flex-grow mb-4 leading-relaxed whitespace-pre-line">
                    {project.description}
                  </p>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {tags.map((tagId) => {
                        const tech = getTechById(tagId);
                        if (!tech) return null;
                        return (
                          <span
                            key={tagId}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 text-[11px] font-medium text-gray-400"
                            title={tech.label}
                          >
                            <span className="w-3 h-3 shrink-0" style={{ color: tech.color }}>
                              {tech.icon}
                            </span>
                            {tech.label}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {(project.link || project.siteUrl) && (
                    <div className="flex flex-wrap gap-3">
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
                        >
                          {/* GitHub icon */}
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                          </svg>
                          GitHub
                        </a>
                      )}
                      {project.siteUrl && (
                        <a
                          href={project.siteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Voir le site
                        </a>
                      )}
                    </div>
                  )}
                </GlassCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
