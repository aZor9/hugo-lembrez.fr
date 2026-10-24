import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales | Hugo Lembrez",
  description:
    "Mentions légales du site hugo-lembrez.fr : éditeur, hébergement, données personnelles et propriété intellectuelle.",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen px-4 py-16 sm:py-24">
      <div className="max-w-3xl mx-auto glass p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">
          <span className="gradient-text">Mentions légales</span>
        </h1>

        <div className="space-y-8 text-sm sm:text-base text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">1. Éditeur du site</h2>
            <p>Le site est édité à titre personnel par : Hugo Lembrez.</p>
            <p>Directeur de la publication : Hugo Lembrez.</p>
            <p>
              Site web :{" "}
              <a
                href="https://hugo-lembrez.fr"
                className="text-indigo-300 hover:text-indigo-200 transition-colors underline"
              >
                https://hugo-lembrez.fr
              </a>
            </p>
            <p>
              Adresse e-mail :{" "}
              <a
                href="mailto:contact@hugo-lembrez.fr"
                className="text-indigo-300 hover:text-indigo-200 transition-colors underline"
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
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">3. Hébergement</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Site web : Vercel Inc., États-Unis (vercel.com).
              </li>
              <li>
                Base de données : Neon, Inc., États-Unis (neon.tech).
              </li>
              <li>
                Code source et versionnement : GitHub, Inc., filiale de Microsoft, États-Unis (github.com).
              </li>
            </ul>
            <p className="mt-2">
              Ces prestataires peuvent traiter des données en dehors de l&apos;Union européenne,
              dans le cadre de clauses contractuelles types ou du cadre de protection des données UE–États-Unis.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">4. Nom de domaine</h2>
            <p>Le nom de domaine hugo-lembrez.fr est enregistré auprès d&apos;OVH SAS (ovhcloud.com), 2 rue Kellermann, 59100 Roubaix, France.</p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">5. Propriété intellectuelle</h2>
            <p>
              Le contenu du site (textes, visuels, structure, code et éléments graphiques)
              est protégé par les dispositions relatives à la propriété intellectuelle.
              Sauf mention contraire, toute reproduction, représentation, diffusion ou
              exploitation, totale ou partielle, sans autorisation préalable, est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">6. Données personnelles (RGPD)</h2>
            <p>
              Ce site est un portfolio : il ne comporte aucun formulaire public, aucun
              compte visiteur ni aucune publicité. Les seules données personnelles
              susceptibles d&apos;être traitées sont :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                les journaux techniques de connexion (adresse IP, date, page consultée)
                générés par l&apos;hébergeur Vercel pour assurer la sécurité et le bon
                fonctionnement du site, conservés selon sa politique de rétention ;
              </li>
              <li>
                votre adresse e-mail et le contenu de votre message si vous m&apos;écrivez à{" "}
                contact@hugo-lembrez.fr, utilisés uniquement pour vous répondre et
                supprimés lorsque l&apos;échange n&apos;a plus d&apos;utilité.
              </li>
            </ul>
            <p className="mt-2">
              Base légale : intérêt légitime (sécurité et exploitation du site) et, pour
              les e-mails, mesures précontractuelles ou consentement de l&apos;expéditeur.
              Aucune donnée n&apos;est vendue ni utilisée à des fins de prospection ou de profilage.
            </p>
            <p className="mt-2">
              Conformément au RGPD et à la loi Informatique et Libertés, vous disposez
              d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation et
              d&apos;opposition. Pour l&apos;exercer, écrivez à{" "}
              <a
                href="mailto:contact@hugo-lembrez.fr"
                className="text-indigo-300 hover:text-indigo-200 transition-colors underline"
              >
                contact@hugo-lembrez.fr
              </a>
              . Je m&apos;engage à répondre dans un délai d&apos;un mois. Si votre demande
              n&apos;aboutit pas, vous conservez le droit d&apos;introduire une réclamation auprès
              de l&apos;autorité de contrôle compétente en France.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">7. Cookies et traceurs</h2>
            <p>
              Ce site ne dépose aucun cookie de suivi, de mesure d&apos;audience ou de
              publicité : aucun bandeau de consentement n&apos;est donc nécessaire. Un cookie
              strictement technique d&apos;authentification n&apos;est utilisé que pour
              l&apos;espace d&apos;administration, réservé au propriétaire du site. Les polices
              de caractères sont servies depuis le site lui-même.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">8. Contact</h2>
            <p>
              Pour toute question, vous pouvez écrire à{" "}
              <a
                href="mailto:contact@hugo-lembrez.fr"
                className="text-indigo-300 hover:text-indigo-200 transition-colors underline"
              >
                contact@hugo-lembrez.fr
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">9. Mise à jour</h2>
            <p>Dernière mise à jour : 25 octobre 2026.</p>
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
