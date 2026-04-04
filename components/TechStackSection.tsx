import { getTechById } from "@/lib/tech-icons";
import type { StackCategoryWithItemsType } from "@/types";

interface TechStackSectionProps {
  title: string;
  categories: StackCategoryWithItemsType[];
}

export default function TechStackSection({ title, categories }: TechStackSectionProps) {
  if (categories.length === 0) return null;

  return (
    <section id="stacks" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          <span className="gradient-text">{title}</span>
        </h2>

        <div className="space-y-10">
          {categories.map((category) => (
            <div key={category.id} className="animate-slide-up">
              <h3 className="text-2xl font-semibold text-white mb-4">{category.name}</h3>

              <div className="flex flex-wrap gap-3">
                {category.items.map((item) => {
                  const tech = getTechById(item.techId);
                  return (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-gray-100"
                    >
                      {tech && (
                        <span className="w-4 h-4 shrink-0" style={{ color: tech.color }}>
                          {tech.icon}
                        </span>
                      )}
                      <span className="text-sm font-medium">{item.label}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
