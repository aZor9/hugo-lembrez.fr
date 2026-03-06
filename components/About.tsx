import GlassCard from "./GlassCard";
import type { ProfileType } from "@/types";

interface AboutProps {
  profile: ProfileType | null;
}

export default function About({ profile }: AboutProps) {
  return (
    <section id="about" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          <span className="gradient-text">À propos</span>
        </h2>

        <GlassCard className="text-center">
          <p className="text-gray-300 text-lg leading-relaxed">
            {profile?.bio ||
              "Développeur passionné avec une expertise en développement web moderne. J'aime créer des applications performantes et élégantes en utilisant les dernières technologies."}
          </p>
        </GlassCard>
      </div>
    </section>
  );
}
