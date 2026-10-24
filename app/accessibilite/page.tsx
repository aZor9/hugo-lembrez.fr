import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Accessibilité | Hugo Lembrez",
  description:
    "Déclaration d'accessibilité du site hugo-lembrez.fr : état de conformité au RGAA, actions menées et moyen de contact.",
  alternates: { canonical: "/accessibilite" },
};

export default function AccessibilitePage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen px-4 py-16 sm:py-24">
      <div className="max-w-3xl mx-auto glass p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">
          <span className="gradient-text">Accessibilité</span>
        </h1>

        <div className="space-y-8 text-sm sm:text-base text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">Engagement</h2>
            <p>
              Hugo Lembrez s&apos;efforce de rendre le site hugo-lembrez.fr accessible,
              conformément au Référentiel Général d&apos;Amélioration de l&apos;Accessibilité
              (RGAA). L&apos;objectif visé est le niveau AA.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">État de conformité</h2>
            <p>
              Le site n&apos;a pas encore fait l&apos;objet d&apos;un audit RGAA complet. Il est donc
              considéré comme <strong className="text-white">non conforme</strong> tant que cet audit
              n&apos;a pas été réalisé. Des corrections ont déjà été apportées.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">Actions déjà menées</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Lien d&apos;évitement « Aller au contenu principal » et repères de page.</li>
              <li>Contrastes de texte renforcés et indicateur de focus clavier visible.</li>
              <li>Navigation complète au clavier, y compris dans les fenêtres modales.</li>
              <li>Liens s&apos;ouvrant dans une nouvelle fenêtre signalés aux lecteurs d&apos;écran.</li>
              <li>Respect du réglage système « réduire les animations ».</li>
              <li>Site adapté aux écrans mobiles et compatible avec le zoom.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">Contenus non accessibles connus</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Les CV au format PDF ne sont pas garantis accessibles. Le fichier peut
                être demandé dans un autre format.
              </li>
              <li>Les contenus de l&apos;espace d&apos;administration n&apos;ont pas été audités.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">Signaler un problème</h2>
            <p>
              Si vous ne parvenez pas à accéder à un contenu, écrivez à{" "}
              <a
                href="mailto:contact@hugo-lembrez.fr"
                className="text-indigo-300 hover:text-indigo-200 transition-colors underline"
              >
                contact@hugo-lembrez.fr
              </a>{" "}
              en précisant la page concernée : je vous fournirai le contenu sous une autre forme.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">Mise à jour</h2>
            <p>Déclaration établie le 25 octobre 2026.</p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10">
          <Link href="/" className="btn-primary inline-flex items-center">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
