import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales | Hugo Lembrez",
  description: "Mentions légales du site hugo-lembrez.fr",
};

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen px-4 py-16 sm:py-24">
      <div className="max-w-3xl mx-auto glass p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">
          <span className="gradient-text">Mentions légales</span>
        </h1>

        <div className="space-y-8 text-sm sm:text-base text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">1. Editeur du site</h2>
            <p>Le site est édité par : Hugo Lembrez.</p>
            <p>
              Site web :{" "}
              <a
                href="https://hugo-lembrez.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                https://hugo-lembrez.fr
              </a>
            </p>
            <p>
              Adresse e-mail :{" "}
              <a
                href="mailto:contact@hugo-lembrez.fr"
                className="text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                contact@hugo-lembrez.fr
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">2. Objet du site</h2>
            <p>
              Le site a pour objet de présenter le portfolio professionnel de Hugo Lembrez,
              incluant notamment ses projets, son profil et ses liens publics.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">3. Hebergement</h2>
            <p>Le site est hébergé et déployé via Vercel.</p>
            <p>Source et versionnement : GitHub.</p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">4. Nom de domaine</h2>
            <p>Le nom de domaine hugo-lembrez.fr est enregistré via OVH.</p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">5. Propriete intellectuelle</h2>
            <p>
              Le contenu du site (textes, visuels, structure, code et éléments graphiques)
              est protégé par les dispositions relatives à la propriété intellectuelle.
              Sauf mention contraire, toute reproduction, représentation, diffusion ou
              exploitation, totale ou partielle, sans autorisation préalable, est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">6. Contact</h2>
            <p>
              Pour toute question, vous pouvez écrire à{" "}
              <a
                href="mailto:contact@hugo-lembrez.fr"
                className="text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                contact@hugo-lembrez.fr
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">7. Mise a jour</h2>
            <p>Dernière mise à jour : 17 mars 2026.</p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10">
          <Link href="/" className="btn-primary inline-flex items-center">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
