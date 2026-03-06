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
                  <p className="text-gray-400 flex-grow mb-4 leading-relaxed">
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

                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
                    >
                      Voir le projet
                      <svg
                        className="w-4 h-4"
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
