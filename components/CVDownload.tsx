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
        <div className="glass p-2 sm:p-4 mb-6">
          <div className="relative w-full rounded-xl overflow-hidden bg-white" style={{ height: "70vh", minHeight: "500px" }}>
            <iframe
              src={`${cv.fileUrl}#view=FitH`}
              className="w-full h-full border-0"
              title="Aperçu du CV"
            />
          </div>
        </div>

        {/* Bouton téléchargement */}
        <div className="text-center">
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
            Télécharger le PDF
          </a>
        </div>
      </div>
    </section>
  );
}
