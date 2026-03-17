"use client";

import { useEffect, useState } from "react";
import type { CvVariant } from "@/types";

interface CvData {
  id: string;
  variant: CvVariant;
  fileUrl: string;
  fileName: string;
  updatedAt: string;
}

const variantConfig: Array<{
  variant: CvVariant;
  title: string;
  description: string;
  publicPath: string;
  uploadLabel: string;
}> = [
  {
    variant: "normal",
    title: "CV principal",
    description: "Version standard avec liens et éléments complets.",
    publicPath: "/CV",
    uploadLabel: "Uploader ou remplacer le CV principal (PDF)",
  },
  {
    variant: "reduit",
    title: "CV léger",
    description:
      "Version aplatie à utiliser si certains visuels ou éléments du CV principal ne se chargent pas correctement.",
    publicPath: "/CV-leger",
    uploadLabel: "Uploader ou remplacer le CV léger (PDF)",
  },
];

function removePdfExtension(fileName: string) {
  return fileName.replace(/\.pdf$/i, "");
}

function sortByVariant(items: CvData[]) {
  return [...items].sort(
    (a, b) =>
      variantConfig.findIndex((entry) => entry.variant === a.variant) -
      variantConfig.findIndex((entry) => entry.variant === b.variant)
  );
}

export default function CVUpload() {
  const [cvs, setCvs] = useState<CvData[]>([]);
  const [uploadingVariant, setUploadingVariant] = useState<CvVariant | null>(null);
  const [message, setMessage] = useState("");
  const [editNames, setEditNames] = useState<Record<CvVariant, string>>({
    normal: "",
    reduit: "",
  });
  const [savingVariant, setSavingVariant] = useState<CvVariant | null>(null);

  useEffect(() => {
    fetch("/api/cv")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;

        const items = sortByVariant(data);
        setCvs(items);
        setEditNames({
          normal: removePdfExtension(items.find((item) => item.variant === "normal")?.fileName || ""),
          reduit: removePdfExtension(items.find((item) => item.variant === "reduit")?.fileName || ""),
        });
      });
  }, []);

  const getCv = (variant: CvVariant) => cvs.find((item) => item.variant === variant) ?? null;

  const applyUpdatedCv = (updatedCv: CvData) => {
    setCvs((current) => {
      const withoutSameVariant = current.filter((item) => item.variant !== updatedCv.variant);
      return sortByVariant([...withoutSameVariant, updatedCv]);
    });

    setEditNames((current) => ({
      ...current,
      [updatedCv.variant]: removePdfExtension(updatedCv.fileName),
    }));
  };

  const handleUpload = async (
    variant: CvVariant,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setMessage("Seuls les fichiers PDF sont acceptés.");
      return;
    }

    setUploadingVariant(variant);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("variant", variant);

    try {
      const res = await fetch("/api/cv", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        applyUpdatedCv(data);
        setMessage(`Le ${variant === "reduit" ? "CV léger" : "CV principal"} a été mis à jour.`);
      } else {
        const err = await res.json();
        setMessage(err.error || "Erreur lors de l'upload.");
      }
    } catch {
      setMessage("Erreur de connexion au serveur.");
    } finally {
      setUploadingVariant(null);
      e.target.value = "";
    }
  };

  const handleRename = async (variant: CvVariant) => {
    const cv = getCv(variant);
    const fileName = editNames[variant].trim();
    if (!cv || !fileName) return;

    setSavingVariant(variant);
    setMessage("");

    try {
      const res = await fetch("/api/cv", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cv.id, fileName: `${fileName}.pdf` }),
      });

      if (res.ok) {
        const data = await res.json();
        applyUpdatedCv(data);
        setMessage(`Le nom du ${variant === "reduit" ? "CV léger" : "CV principal"} a été mis à jour.`);
      } else {
        const err = await res.json();
        setMessage(err.error || "Erreur lors du renommage.");
      }
    } catch {
      setMessage("Erreur de connexion au serveur.");
    } finally {
      setSavingVariant(null);
    }
  };

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-xl font-semibold text-white">Gestion des CV</h2>
        <p className="mt-1 text-sm text-gray-400">
          Gère ici le CV principal et une version légère de secours pour les cas où certains éléments s&apos;affichent mal après téléchargement.
        </p>
      </div>

      <div className="grid gap-4">
        {variantConfig.map((entry) => {
          const cv = getCv(entry.variant);
          const formattedDate = cv
            ? new Date(cv.updatedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : null;

          return (
            <div key={entry.variant} className="space-y-4 rounded-2xl bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-white">{entry.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">{entry.description}</p>
                </div>
                <a
                  href={entry.publicPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-sm text-indigo-400 transition-colors hover:text-indigo-300"
                >
                  Voir →
                </a>
              </div>

              {cv ? (
                <div className="rounded-xl border border-white/10 bg-slate-950/30 p-3">
                  <p className="truncate text-sm font-medium text-gray-200">{cv.fileName}</p>
                  <p className="mt-1 text-xs text-gray-500">Dernière mise à jour : {formattedDate}</p>
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-white/10 bg-slate-950/20 px-3 py-4 text-sm text-gray-500">
                  Aucun fichier n&apos;est encore uploadé pour cette version.
                </p>
              )}

              {cv && (
                <div className="border-t border-white/5 pt-2">
                  <label className="mb-1.5 block text-xs text-gray-500">Nom du fichier au téléchargement</label>
                  <div className="flex gap-2">
                    <div className="flex flex-1 items-center gap-0">
                      <input
                        type="text"
                        value={editNames[entry.variant]}
                        onChange={(e) =>
                          setEditNames((current) => ({
                            ...current,
                            [entry.variant]: e.target.value,
                          }))
                        }
                        className="input-glass flex-1 text-sm !rounded-r-none"
                        placeholder={entry.variant === "reduit" ? "Mon CV leger" : "Mon CV"}
                      />
                      <span className="rounded-r-xl border border-l-0 border-white/10 bg-white/5 px-3 py-2.5 text-sm text-gray-500">
                        .pdf
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRename(entry.variant)}
                      disabled={
                        savingVariant === entry.variant ||
                        `${editNames[entry.variant].trim()}.pdf` === cv.fileName ||
                        !editNames[entry.variant].trim()
                      }
                      className="btn-primary !px-4 !py-2 text-sm disabled:opacity-40"
                    >
                      {savingVariant === entry.variant ? "..." : "Renommer"}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block">
                  <span className="mb-2 block text-sm text-gray-400">{entry.uploadLabel}</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => handleUpload(entry.variant, e)}
                    disabled={uploadingVariant === entry.variant}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-indigo-500/20 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-indigo-300 file:transition-all hover:file:bg-indigo-500/30 disabled:opacity-50"
                  />
                </label>
              </div>

              {uploadingVariant === entry.variant && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-indigo-500" />
                  Upload en cours...
                </div>
              )}
            </div>
          );
        })}
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.includes("mis à jour") ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
