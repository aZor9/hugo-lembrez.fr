"use client";

import { useEffect, useMemo, useState } from "react";

interface EducationItem {
  id: string;
  title: string;
  school: string;
  period: string;
  statusLabel: string | null;
  description: string | null;
  order: number;
  visible: boolean;
}

interface EducationSettings {
  educationVisible: boolean;
  educationTitle: string;
  educationLeadVisible: boolean;
  educationLeadTitle: string;
  educationLeadSubtitle: string;
}

export default function EducationManager() {
  const [items, setItems] = useState<EducationItem[]>([]);
  const [settings, setSettings] = useState<EducationSettings>({
    educationVisible: true,
    educationTitle: "Formation",
    educationLeadVisible: true,
    educationLeadTitle: "En recherche d'une formation en alternance",
    educationLeadSubtitle: "Ouvert aux opportunités",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    school: "",
    period: "",
    statusLabel: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const orderedItems = useMemo(() => [...items].sort((a, b) => a.order - b.order), [items]);

  const fetchAll = async () => {
    const [itemsRes, settingsRes] = await Promise.all([
      fetch("/api/education?all=1"),
      fetch("/api/home-sections"),
    ]);

    if (itemsRes.ok) {
      setItems(await itemsRes.json());
    }

    if (settingsRes.ok) {
      const data = await settingsRes.json();
      setSettings({
        educationVisible: data.educationVisible,
        educationTitle: data.educationTitle,
        educationLeadVisible: data.educationLeadVisible,
        educationLeadTitle: data.educationLeadTitle,
        educationLeadSubtitle: data.educationLeadSubtitle,
      });
    }
  };

  const saveSettings = async (partial: Partial<EducationSettings>) => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/home-sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });

      if (!res.ok) throw new Error();
      setSettings((prev) => ({ ...prev, ...partial }));
      setMessage("Paramètres de section sauvegardés.");
    } catch {
      setMessage("Erreur lors de la sauvegarde des paramètres.");
    } finally {
      setSaving(false);
    }
  };

  const submitItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.school.trim() || !form.period.trim()) {
      setMessage("Le titre, l'école et la période sont requis.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const url = editingId ? `/api/education/${editingId}` : "/api/education";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          school: form.school,
          period: form.period,
          statusLabel: form.statusLabel,
          description: form.description,
        }),
      });

      if (!res.ok) throw new Error();

      await fetchAll();
      setEditingId(null);
      setForm({ title: "", school: "", period: "", statusLabel: "", description: "" });
      setMessage(editingId ? "Formation mise à jour." : "Formation ajoutée.");
    } catch {
      setMessage("Erreur lors de la sauvegarde de la formation.");
    } finally {
      setSaving(false);
    }
  };

  const editItem = (item: EducationItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      school: item.school,
      period: item.period,
      statusLabel: item.statusLabel || "",
      description: item.description || "",
    });
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Supprimer cette formation ?")) return;

    const res = await fetch(`/api/education/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchAll();
      setMessage("Formation supprimée.");
    }
  };

  const toggleVisible = async (item: EducationItem) => {
    const res = await fetch(`/api/education/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !item.visible }),
    });

    if (res.ok) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, visible: !i.visible } : i))
      );
    }
  };

  const moveItem = async (index: number, direction: "up" | "down") => {
    const list = [...orderedItems];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= list.length) return;

    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];

    setItems(list.map((item, idx) => ({ ...item, order: idx })));

    await fetch("/api/education", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: list.map((item) => item.id) }),
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Formation</h2>

        <div className="bg-white/5 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-200">Afficher la section sur le site</p>
              <p className="text-xs text-gray-500">Sous les stacks techniques</p>
            </div>
            <button
              onClick={() => saveSettings({ educationVisible: !settings.educationVisible })}
              className={`px-3 py-1.5 text-xs rounded-lg ${
                settings.educationVisible
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-white/5 text-gray-500"
              }`}
            >
              {settings.educationVisible ? "Visible" : "Masquée"}
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={settings.educationTitle}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, educationTitle: e.target.value }))
              }
              placeholder="Titre de section"
              className="input-glass"
            />
            <button
              onClick={() => saveSettings({ educationTitle: settings.educationTitle })}
              className="btn-secondary text-sm"
            >
              Enregistrer le titre
            </button>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-200">Afficher la carte d'introduction</p>
              <button
                onClick={() => saveSettings({ educationLeadVisible: !settings.educationLeadVisible })}
                className={`px-3 py-1.5 text-xs rounded-lg ${
                  settings.educationLeadVisible
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-white/5 text-gray-500"
                }`}
              >
                {settings.educationLeadVisible ? "Visible" : "Masquée"}
              </button>
            </div>

            <input
              type="text"
              value={settings.educationLeadTitle}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, educationLeadTitle: e.target.value }))
              }
              placeholder="Texte principal de la carte"
              className="input-glass"
            />
            <input
              type="text"
              value={settings.educationLeadSubtitle}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, educationLeadSubtitle: e.target.value }))
              }
              placeholder="Texte secondaire de la carte"
              className="input-glass"
            />
            <button
              onClick={() =>
                saveSettings({
                  educationLeadTitle: settings.educationLeadTitle,
                  educationLeadSubtitle: settings.educationLeadSubtitle,
                })
              }
              className="btn-secondary text-sm"
            >
              Enregistrer la carte d'introduction
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {orderedItems.map((item, index) => (
          <div key={item.id} className={`bg-white/5 rounded-xl p-4 ${!item.visible ? "opacity-50" : ""}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => moveItem(index, "up")}
                    disabled={index === 0}
                    className="w-6 h-6 rounded bg-white/5 disabled:opacity-20"
                    title="Monter"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveItem(index, "down")}
                    disabled={index === orderedItems.length - 1}
                    className="w-6 h-6 rounded bg-white/5 disabled:opacity-20"
                    title="Descendre"
                  >
                    ↓
                  </button>
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-medium truncate">{item.title}</h3>
                  <p className="text-sm text-gray-400 truncate">{item.school}</p>
                  <p className="text-xs text-gray-500">{item.period}</p>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => toggleVisible(item)}
                  className={`px-3 py-1.5 text-xs rounded-lg ${
                    item.visible
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-white/5 text-gray-500"
                  }`}
                >
                  {item.visible ? "Visible" : "Masquée"}
                </button>
                <button
                  onClick={() => editItem(item)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-indigo-500/20 text-indigo-300"
                >
                  Modifier
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-red-500/20 text-red-300"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}

        {orderedItems.length === 0 && (
          <p className="text-sm text-gray-500">Aucune formation pour le moment.</p>
        )}
      </div>

      <div className="border-t border-white/10 pt-6">
        <h3 className="text-sm font-medium text-gray-300 mb-4">
          {editingId ? "✏️ Modifier la formation" : "➕ Ajouter une formation"}
        </h3>

        <form onSubmit={submitItem} className="space-y-4">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Intitulé (ex: BIA)"
            className="input-glass"
            required
          />

          <input
            type="text"
            value={form.school}
            onChange={(e) => setForm((prev) => ({ ...prev, school: e.target.value }))}
            placeholder="Établissement (ex: Lycée Clémenceau, Montpellier)"
            className="input-glass"
            required
          />

          <input
            type="text"
            value={form.period}
            onChange={(e) => setForm((prev) => ({ ...prev, period: e.target.value }))}
            placeholder="Période (ex: 2023 - 2025)"
            className="input-glass"
            required
          />

          <input
            type="text"
            value={form.statusLabel}
            onChange={(e) => setForm((prev) => ({ ...prev, statusLabel: e.target.value }))}
            placeholder="Statut (ex: Obtenu)"
            className="input-glass"
          />

          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Description optionnelle"
            className="input-glass resize-none"
            rows={3}
          />

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {editingId ? "Mettre à jour" : "Ajouter"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ title: "", school: "", period: "", statusLabel: "", description: "" });
                }}
                className="btn-secondary text-sm"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      {message && (
        <p className={`text-sm ${message.includes("Erreur") ? "text-red-400" : "text-green-400"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
