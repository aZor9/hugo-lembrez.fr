import type { CvType } from "@/types";

interface CVDownloadProps {
  cv: CvType | null;
  inline?: boolean;
}

export default function CVDownload({ cv, inline = false }: CVDownloadProps) {
  if (!cv) return null;

  const formattedDate = new Date(cv.updatedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (inline) {
    return (
      <a
        href={cv.fileUrl}
        download={cv.fileName}
        className="btn-primary inline-flex items-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Télécharger mon CV
      </a>
    );
  }

  return (
    <section id="cv-preview" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          <span className="gradient-text">Mon CV</span>
        </h2>
        <p className="text-center text-sm text-gray-500 mb-8">
          Mis à jour le {formattedDate}
        </p>

        {/* Aperçu PDF */}
        <div className="glass p-2 sm:p-4 mb-4">
          <div className="relative w-full rounded-xl overflow-hidden bg-white" style={{ minHeight: "60vh", height: "70vh" }}>
            <object
              data={cv.fileUrl}
              type="application/pdf"
              className="w-full h-full"
              aria-label="Aperçu du CV"
            >
              {/* Fallback automatique si le navigateur ne supporte pas (ex: Chrome Android) */}
              <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center bg-slate-900">
                <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-400 text-sm max-w-xs">
                  La prévisualisation PDF n&apos;est pas disponible sur ce navigateur.
                </p>
                <a
                  href={cv.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Ouvrir le CV
                </a>
              </div>
            </object>
          </div>
        </div>

        {/* Boutons de la preview */}
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          <a
            href={cv.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Ouvrir dans un nouvel onglet
          </a>
          <a
            href={cv.fileUrl}
            download={cv.fileName}
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Télécharger
          </a>
        </div>
        
      </div>
    </section>
  );
}
