import type { EducationItemType } from "@/types";

interface EducationSectionProps {
  title: string;
  leadVisible: boolean;
  leadTitle: string;
  leadSubtitle: string;
  items: EducationItemType[];
}

export default function EducationSection({
  title,
  leadVisible,
  leadTitle,
  leadSubtitle,
  items,
}: EducationSectionProps) {
  if (!leadVisible && items.length === 0) return null;

  return (
    <section id="formation" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          <span className="gradient-text">{title}</span>
        </h2>

        <div className="relative space-y-6 sm:space-y-7">
          <div className="absolute left-6 sm:left-7 top-4 bottom-4 w-px bg-white/15" />

          {leadVisible && (
            <article className="grid grid-cols-[3rem_1fr] sm:grid-cols-[3.5rem_1fr] items-stretch gap-0">
              <div className="relative">
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-300 bg-[#070b14] shadow-[0_0_0_3px_rgba(2,6,23,0.95)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                </span>
              </div>

              <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-5 sm:px-8 py-6 sm:py-8">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-gray-300 mt-0.5 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <div>
                    <p className="text-lg sm:text-2xl font-semibold text-white mb-1">{leadTitle}</p>
                    <p className="text-sm sm:text-lg text-gray-400">{leadSubtitle}</p>
                  </div>
                </div>
              </div>
            </article>
          )}

          {items.map((item) => (
            <article key={item.id} className="grid grid-cols-[3rem_1fr] sm:grid-cols-[3.5rem_1fr] items-stretch gap-0">
              <div className="relative">
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-emerald-400 bg-[#070b14] shadow-[0_0_0_3px_rgba(2,6,23,0.95)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 sm:px-6 py-6 sm:py-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xl sm:text-2xl font-semibold text-white leading-tight">{item.title}</p>
                    <p className="text-base sm:text-xl text-gray-300 mt-1 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M22 10L12 5 2 10l10 5 10-5z" />
                        <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
                      </svg>
                      <span>{item.school}</span>
                    </p>
                  </div>

                  {item.statusLabel && (
                    <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-300 px-3 py-1 text-sm font-medium w-fit">
                      {item.statusLabel}
                    </span>
                  )}
                </div>

                <p className="text-base text-gray-400 mb-2">{item.period}</p>
                {item.description && (
                  <p className="text-sm sm:text-base text-gray-400 whitespace-pre-line">{item.description}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
