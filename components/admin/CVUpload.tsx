"use client";

import { useState, useEffect } from "react";

interface CvData {
  id: string;
  fileUrl: string;
  fileName: string;
  updatedAt: string;
}

export default function CVUpload() {
  const [cv, setCv] = useState<CvData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/cv")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setCv(data);
          setEditName(data.fileName.replace(/\.pdf$/i, ""));
        }
      });
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setMessage("Seuls les fichiers PDF sont acceptés.");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/cv", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setCv(data);
        setEditName(data.fileName.replace(/\.pdf$/i, ""));
        setMessage("CV mis à jour avec succès !");
      } else {
        const err = await res.json();
        setMessage(err.error || "Erreur lors de l'upload.");
      }
    } catch {
      setMessage("Erreur de connexion au serveur.");
    } finally {
      setUploading(false);
      // Reset le champ file
      e.target.value = "";
    }
  };

  const handleRename = async () => {
    if (!cv || !editName.trim()) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/cv", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: editName.trim() + ".pdf" }),
      });
      if (res.ok) {
        const data = await res.json();
        setCv(data);
        setMessage("Nom du CV mis à jour !");
      } else {
        const err = await res.json();
        setMessage(err.error || "Erreur lors du renommage.");
      }
    } catch {
      setMessage("Erreur de connexion au serveur.");
    } finally {
      setSaving(false);
    }
  };

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
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Gestion du CV</h2>

      {/* CV actuel */}
      {cv && (
        <div className="bg-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm text-gray-300 font-medium truncate">
                {cv.fileName}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Dernière mise à jour : {formattedDate}
              </p>
            </div>
            <a
              href="/CV"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Voir →
            </a>
          </div>

          {/* Renommer le PDF */}
          <div className="pt-2 border-t border-white/5">
            <label className="text-xs text-gray-500 block mb-1.5">Nom du fichier au téléchargement</label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-0">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-glass flex-1 text-sm !rounded-r-none"
                  placeholder="Mon CV"
                />
                <span className="px-3 py-2.5 bg-white/5 border border-l-0 border-white/10 rounded-r-xl text-sm text-gray-500">.pdf</span>
              </div>
              <button
                type="button"
                onClick={handleRename}
                disabled={saving || editName.trim() + ".pdf" === cv.fileName}
                className="btn-primary !py-2 !px-4 text-sm disabled:opacity-40"
              >
                {saving ? "..." : "Renommer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!cv && (
        <p className="text-sm text-gray-500">Aucun CV uploadé pour le moment.</p>
      )}

      {/* Upload */}
      <div>
        <label className="block">
          <span className="text-sm text-gray-400 mb-2 block">
            {cv ? "Remplacer le CV (PDF)" : "Uploader un CV (PDF)"}
          </span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0
              file:text-sm file:font-medium file:bg-indigo-500/20 file:text-indigo-300
              hover:file:bg-indigo-500/30 file:cursor-pointer file:transition-all
              disabled:opacity-50"
          />
        </label>
      </div>

      {/* Loading */}
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-indigo-500" />
          Upload en cours...
        </div>
      )}

      {/* Message */}
      {message && (
        <p
          className={`text-sm ${
            message.includes("succès") ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
