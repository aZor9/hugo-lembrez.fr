"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ImageCropper from "./ImageCropper";

interface ProfileData {
  id: string;
  name: string;
  title: string;
  bio: string;
  imageUrl: string | null;
}

export default function ProfileManager() {
  const [profile, setProfile] = useState<ProfileData>({
    id: "",
    name: "",
    title: "",
    bio: "",
    imageUrl: null,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [cropFile, setCropFile] = useState<File | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data) setProfile(data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          title: profile.title,
          bio: profile.bio,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setMessage("Profil mis à jour !");
      } else {
        const err = await res.json();
        setMessage(err.error || "Erreur lors de la sauvegarde.");
      }
    } catch {
      setMessage("Erreur de connexion au serveur.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropFile(file);
    setMessage("");
    e.target.value = "";
  };

  const handleCrop = async (
    file: File,
    crop: { x: number; y: number; width: number; height: number }
  ) => {
    setUploading(true);
    setCropFile(null);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("crop", JSON.stringify(crop));

    try {
      const res = await fetch("/api/profile/image", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setProfile({ ...profile, imageUrl: data.imageUrl });
        setMessage("Photo mise à jour !");
      } else {
        const err = await res.json();
        setMessage(err.error || "Erreur lors de l'upload.");
      }
    } catch {
      setMessage("Erreur de connexion au serveur.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Mon Profil</h2>

      {/* Recadrage d'image */}
      {cropFile && (
        <div className="glass p-4">
          <ImageCropper
            file={cropFile}
            onCrop={handleCrop}
            onCancel={() => setCropFile(null)}
          />
        </div>
      )}

      {/* Photo de profil */}
      {!cropFile && (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-lg">
            {profile.imageUrl ? (
              <Image
                src={profile.imageUrl}
                alt="Photo de profil"
                width={96}
                height={96}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                <span className="text-2xl font-bold gradient-text">
                  {profile.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "?"}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <label className="block">
              <span className="text-sm text-gray-400 mb-2 block">
                Photo de profil (JPG, PNG, WebP — max 5 Mo)
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                onChange={handleFileSelect}
                disabled={uploading}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0
                  file:text-sm file:font-medium file:bg-indigo-500/20 file:text-indigo-300
                  hover:file:bg-indigo-500/30 file:cursor-pointer file:transition-all
                  disabled:opacity-50"
              />
            </label>
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-indigo-500" />
                Upload en cours...
              </div>
            )}
            <p className="text-xs text-gray-600 mt-1">
              L&apos;image sera automatiquement recadrée en carré (512×512px)
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm text-gray-400 mb-2">
            Nom complet
          </label>
          <input
            id="name"
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="input-glass"
            placeholder="Hugo Lembrez"
            required
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm text-gray-400 mb-2">
            Titre / Poste
          </label>
          <input
            id="title"
            type="text"
            value={profile.title}
            onChange={(e) => setProfile({ ...profile, title: e.target.value })}
            className="input-glass"
            placeholder="Développeur Full-Stack"
            required
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm text-gray-400 mb-2">
            Biographie
          </label>
          <textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={5}
            className="input-glass resize-none"
            placeholder="Parlez de vous..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>

        {message && (
          <p
            className={`text-sm ${
              message.includes("mis à jour")
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
