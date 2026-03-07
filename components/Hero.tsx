import Image from "next/image";
import CVDownload from "./CVDownload";
import type { ProfileType, CvType } from "@/types";

interface HeroProps {
  profile: ProfileType | null;
  cv: CvType | null;
}

export default function Hero({ profile, cv }: HeroProps) {
  const initials =
    profile?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("") || "HL";

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center px-4 pt-20"
    >
      <div className="max-w-4xl mx-auto text-center animate-fade-in">
        {/* Avatar */}
        <div className="mb-8 flex justify-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-2xl shadow-purple-500/20">
            {profile?.imageUrl ? (
              <Image
                src={profile.imageUrl}
                alt={profile.name || "Photo de profil"}
                width={128}
                height={128}
                className="w-full h-full rounded-full object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                <span className="text-4xl font-bold gradient-text">
                  {initials}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Texte */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-4 tracking-tight">
          <span className="gradient-text">
            {profile?.name || "Hugo Lembrez"}
          </span>
        </h1>

        <p className="text-xl sm:text-2xl text-gray-400 mb-4">
          {profile?.title || "Développeur Full-Stack"}
        </p>

        <p className="text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
          {profile?.bio ||
            "Passionné par le développement web moderne et les technologies innovantes."}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <CVDownload cv={cv} inline />
          <a href="#projects" className="btn-secondary">
            Voir mes projets
          </a>
        </div>
      </div>
    </section>
  );
}
