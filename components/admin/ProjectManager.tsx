"use client";

import { useState, useEffect } from "react";
import { TECH_LIST } from "@/lib/tech-icons";

interface Project {
  id: string;
  title: string;
  description: string;
  link: string | null;
  siteUrl: string | null;
  tags: string;
  order: number;
  visible: boolean;
}

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", link: "", siteUrl: "", tags: [] as string[] });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const url = editing ? `/api/projects/${editing}` : "/api/projects";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags: form.tags }),
      });

      if (res.ok) {
        await fetchProjects();
        resetForm();
        setMessage(editing ? "Projet mis à jour !" : "Projet ajouté !");
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

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce projet ?")) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchProjects();
        setMessage("Projet supprimé.");
        if (editing === id) resetForm();
      }
    } catch {
      setMessage("Erreur de connexion au serveur.");
    }
  };

  const handleEdit = (project: Project) => {
    setEditing(project.id);
    let parsedTags: string[] = [];
    try { parsedTags = JSON.parse(project.tags || "[]"); } catch { /* ignore */ }
    setForm({
      title: project.title,
      description: project.description,
      link: project.link || "",
      siteUrl: project.siteUrl || "",
      tags: parsedTags,
    });
    setMessage("");
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ title: "", description: "", link: "", siteUrl: "", tags: [] });
  };

  const toggleVisible = async (project: Project) => {
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !project.visible }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, visible: !p.visible } : p))
        );
      }
    } catch {
      setMessage("Erreur lors du changement de visibilité.");
    }
  };

  const toggleTag = (id: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(id)
        ? prev.tags.filter((t) => t !== id)
        : [...prev.tags, id],
    }));
  };

  const moveProject = async (index: number, direction: "up" | "down") => {
    const newProjects = [...projects];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newProjects.length) return;
    [newProjects[index], newProjects[swapIndex]] = [newProjects[swapIndex], newProjects[index]];
    setProjects(newProjects);
    try {
      await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: newProjects.map((p) => p.id) }),
      });
    } catch {
      setMessage("Erreur lors du réordonnancement.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Mes Projets</h2>

      {/* Liste des projets */}
      {projects.length > 0 ? (
        <div className="space-y-3">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`bg-white/5 rounded-xl p-4 transition-all ${
                editing === project.id ? "ring-1 ring-indigo-500/30" : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Boutons réordonnancement */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={() => moveProject(index, "up")}
                      disabled={index === 0}
                      className="w-10 h-10 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                      title="Monter"
                    >
                      <svg aria-hidden="true" className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveProject(index, "down")}
                      disabled={index === projects.length - 1}
                      className="w-10 h-10 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                      title="Descendre"
                    >
                      <svg aria-hidden="true" className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-white truncate">{project.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-1">{project.description}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => toggleVisible(project)}
                    title={project.visible ? "Masquer" : "Afficher"}
                    className={`px-3 py-2.5 sm:py-1.5 text-xs rounded-lg transition-all ${
                      project.visible
                        ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {project.visible ? (
                      <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(project)}
                    className="px-3 py-2.5 sm:py-1.5 text-xs bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition-all"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="px-3 py-2.5 sm:py-1.5 text-xs bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">Aucun projet pour le moment.</p>
      )}

      {/* Formulaire */}
      <div className="border-t border-white/10 pt-6">
        <h3 className="text-sm font-medium text-gray-300 mb-4">
          {editing ? "✏️ Modifier le projet" : "➕ Ajouter un projet"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              aria-label="Titre du projet"
              placeholder="Titre du projet"
              className="input-glass"
              required
            />
          </div>

          <div>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              aria-label="Description du projet"
              placeholder="Description du projet"
              rows={3}
              className="input-glass resize-none"
              required
            />
          </div>

          <div>
            <input
              type="url"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              aria-label="URL GitHub (optionnel)"
              placeholder="URL GitHub (optionnel)"
              className="input-glass"
            />
          </div>

          <div>
            <input
              type="url"
              value={form.siteUrl}
              onChange={(e) => setForm({ ...form, siteUrl: e.target.value })}
              aria-label="URL du site live (optionnel)"
              placeholder="URL du site live (optionnel)"
              className="input-glass"
            />
          </div>

          {/* Sélecteur de technologies */}
          <div>
            <label className="text-xs text-gray-400 block mb-2">Technologies</label>
            <div className="flex flex-wrap gap-2">
              {TECH_LIST.map((tech) => {
                const active = form.tags.includes(tech.id);
                return (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => toggleTag(tech.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      active
                        ? "border-white/20 bg-white/10 text-white"
                        : "border-white/5 bg-white/[0.02] text-gray-400 hover:bg-white/5 hover:text-gray-300"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: active ? tech.color : undefined }}
                    >
                      {tech.icon}
                    </span>
                    {tech.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving
                ? "Sauvegarde..."
                : editing
                ? "Mettre à jour"
                : "Ajouter"}
            </button>

            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary text-sm"
              >
                Annuler
              </button>
            )}
          </div>

          {message && (
            <p role="status"
              className={`text-sm ${
                message.includes("Erreur") ? "text-red-400" : "text-green-400"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
