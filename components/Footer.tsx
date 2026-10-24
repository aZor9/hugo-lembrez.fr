export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="py-12 px-4 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Contact */}
          <div>
            <h2 className="text-lg font-semibold gradient-text mb-4">
              Contact
            </h2>
            <div className="space-y-2 text-gray-400 text-sm">
              <p>
                <a
                  href="mailto:contact@hugo-lembrez.fr"
                  className="hover:text-white transition-colors"
                >
                  contact@hugo-lembrez.fr
                </a>
              </p>
            </div>
          </div>

          {/* Liens */}
          <div>
            <h2 className="text-lg font-semibold gradient-text mb-4">Liens</h2>
            <div className="space-y-2 text-gray-400 text-sm">
              <p>
                <a href="/links" className="hover:text-white transition-colors">
                  Tous mes liens
                </a>
              </p>
              <p>
                <a
                  href="https://github.com/aZor9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GitHub<span className="sr-only"> (nouvelle fenêtre)</span>
                </a>
              </p>
              <p>
                <a
                  href="https://www.linkedin.com/in/hugo-lembrez/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  LinkedIn<span className="sr-only"> (nouvelle fenêtre)</span>
                </a>
              </p>
            </div>
          </div>

          {/* Mentions légales */}
          <div>
            <h2 className="text-lg font-semibold gradient-text mb-4">
              Mentions légales
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <a
                  href="/mentions-legales"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Mentions légales et confidentialité
                </a>
              </p>
              <p>
                <a
                  href="/accessibilite"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Accessibilité
                </a>
              </p>
              <p className="text-gray-400">© {year} Hugo Lembrez. Tous droits réservés.</p>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="mt-12 pt-6 border-t border-white/5 text-center">
          <p className="text-gray-400 text-xs">
            Construit avec Next.js, Tailwind CSS & Prisma
          </p>
        </div>
      </div>
    </footer>
  );
}
