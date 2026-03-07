"use client";

import { useState, useEffect } from "react";

interface Link {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  url: string;
  order: number;
  visible: boolean;
}

export default function LinkManager() {
  const [links, setLinks] = useState<Link[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", icon: "", url: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    const res = await fetch("/api/links?all=1");
    const data = await res.json();
    setLinks(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const url = editing ? `/api/links/${editing}` : "/api/links";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await fetchLinks();
        resetForm();
        setMessage(editing ? "Lien mis à jour !" : "Lien ajouté !");
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
    if (!confirm("Supprimer ce lien ?")) return;

    try {
      const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchLinks();
        setMessage("Lien supprimé.");
        if (editing === id) resetForm();
      }
    } catch {
      setMessage("Erreur de connexion au serveur.");
    }
  };

  const handleEdit = (link: Link) => {
    setEditing(link.id);
    setForm({
      name: link.name,
      description: link.description || "",
      icon: link.icon || "",
      url: link.url,
    });
    setMessage("");
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ name: "", description: "", icon: "", url: "" });
  };

  const toggleVisible = async (link: Link) => {
    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !link.visible }),
      });
      if (res.ok) {
        setLinks((prev) =>
          prev.map((l) => (l.id === link.id ? { ...l, visible: !l.visible } : l))
        );
      }
    } catch {
      setMessage("Erreur lors du changement de visibilité.");
    }
  };

  const moveLink = async (index: number, direction: "up" | "down") => {
    const newLinks = [...links];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newLinks.length) return;
    [newLinks[index], newLinks[swapIndex]] = [newLinks[swapIndex], newLinks[index]];
    setLinks(newLinks);
    try {
      await fetch("/api/links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: newLinks.map((l) => l.id) }),
      });
    } catch {
      setMessage("Erreur lors du réordonnancement.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Mes Liens</h2>
      <p className="text-sm text-gray-500">Ces liens apparaissent sur la page <code className="text-indigo-400">/links</code>.</p>

      {/* Liste des liens */}
      {links.length > 0 ? (
        <div className="space-y-3">
          {links.map((link, index) => (
            <div
              key={link.id}
              className={`bg-white/5 rounded-xl p-4 transition-all ${
                editing === link.id ? "ring-1 ring-indigo-500/30" : ""
              } ${!link.visible ? "opacity-50" : ""}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Boutons réordonnancement */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={() => moveLink(index, "up")}
                      disabled={index === 0}
                      className="w-6 h-6 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                      title="Monter"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveLink(index, "down")}
                      disabled={index === links.length - 1}
                      className="w-6 h-6 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                      title="Descendre"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {/* Icône */}
                  {link.icon && (
                    <span className="text-xl shrink-0">{link.icon}</span>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-medium text-white truncate">{link.name}</h3>
                    {link.description && (
                      <p className="text-sm text-gray-400 line-clamp-1">{link.description}</p>
                    )}
                    <p className="text-xs text-gray-600 truncate">{link.url}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => toggleVisible(link)}
                    title={link.visible ? "Masquer" : "Afficher"}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                      link.visible
                        ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                        : "bg-white/5 text-gray-500 hover:bg-white/10"
                    }`}
                  >
                    {link.visible ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(link)}
                    className="px-3 py-1.5 text-xs bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition-all"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
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
        <p className="text-sm text-gray-500">Aucun lien pour le moment.</p>
      )}

      {/* Formulaire */}
      <div className="border-t border-white/10 pt-6">
        <h3 className="text-sm font-medium text-gray-300 mb-4">
          {editing ? "✏️ Modifier le lien" : "➕ Ajouter un lien"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nom (ex: GitHub)"
              className="input-glass"
              required
            />
          </div>

          <div>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description (optionnel)"
              className="input-glass"
            />
          </div>

          <div>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="Icône emoji (ex: 🐙, 💼)"
              className="input-glass"
            />
          </div>

          <div>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="URL (https://...)"
              className="input-glass"
              required
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Sauvegarde..." : editing ? "Mettre à jour" : "Ajouter"}
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
