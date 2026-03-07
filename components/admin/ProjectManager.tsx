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
                      className="w-6 h-6 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                      title="Monter"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveProject(index, "down")}
                      disabled={index === projects.length - 1}
                      className="w-6 h-6 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                      title="Descendre"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    onClick={() => handleEdit(project)}
                    className="px-3 py-1.5 text-xs bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition-all"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="px-3 py-1.5 text-xs bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Aucun projet pour le moment.</p>
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
              placeholder="URL GitHub (optionnel)"
              className="input-glass"
            />
          </div>

          <div>
            <input
              type="url"
              value={form.siteUrl}
              onChange={(e) => setForm({ ...form, siteUrl: e.target.value })}
              placeholder="URL du site live (optionnel)"
              className="input-glass"
            />
          </div>

          {/* Sélecteur de technologies */}
          <div>
            <label className="text-xs text-gray-500 block mb-2">Technologies</label>
            <div className="flex flex-wrap gap-2">
              {TECH_LIST.map((tech) => {
                const active = form.tags.includes(tech.id);
                return (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => toggleTag(tech.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      active
                        ? "border-white/20 bg-white/10 text-white"
                        : "border-white/5 bg-white/[0.02] text-gray-500 hover:bg-white/5 hover:text-gray-300"
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
            <p
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
