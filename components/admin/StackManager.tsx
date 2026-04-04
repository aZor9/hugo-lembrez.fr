"use client";

import { useEffect, useMemo, useState } from "react";
import { TECH_LIST, getTechById } from "@/lib/tech-icons";

interface StackItem {
  id: string;
  techId: string;
  label: string;
  categoryId: string;
  order: number;
  visible: boolean;
}

interface StackCategory {
  id: string;
  name: string;
  order: number;
  visible: boolean;
  items: StackItem[];
}

interface HomeSettings {
  stacksVisible: boolean;
  stacksTitle: string;
}

export default function StackManager() {
  const [categories, setCategories] = useState<StackCategory[]>([]);
  const [settings, setSettings] = useState<HomeSettings>({
    stacksVisible: true,
    stacksTitle: "Stacks techniques",
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({
    techId: TECH_LIST[0]?.id ?? "react",
    label: TECH_LIST[0]?.label ?? "React",
    categoryId: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories]
  );

  const fetchAll = async () => {
    const [catRes, settingsRes] = await Promise.all([
      fetch("/api/stack-categories?all=1"),
      fetch("/api/home-sections"),
    ]);

    if (catRes.ok) {
      const data = await catRes.json();
      setCategories(data);
      if (data.length > 0) {
        setItemForm((prev) => ({ ...prev, categoryId: prev.categoryId || data[0].id }));
      }
    }

    if (settingsRes.ok) {
      const data = await settingsRes.json();
      setSettings({
        stacksVisible: data.stacksVisible,
        stacksTitle: data.stacksTitle,
      });
    }
  };

  const saveSettings = async (partial: Partial<HomeSettings>) => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/home-sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });

      if (!res.ok) {
        throw new Error("Erreur de sauvegarde");
      }

      setSettings((prev) => ({ ...prev, ...partial }));
      setMessage("Paramètres de section sauvegardés.");
    } catch {
      setMessage("Erreur lors de la sauvegarde des paramètres.");
    } finally {
      setSaving(false);
    }
  };

  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setSaving(true);
    setMessage("");

    try {
      const url = editingCategory
        ? `/api/stack-categories/${editingCategory}`
        : "/api/stack-categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName.trim() }),
      });

      if (!res.ok) throw new Error();

      await fetchAll();
      setEditingCategory(null);
      setCategoryName("");
      setMessage(editingCategory ? "Catégorie mise à jour." : "Catégorie ajoutée.");
    } catch {
      setMessage("Erreur lors de la sauvegarde de la catégorie.");
    } finally {
      setSaving(false);
    }
  };

  const editCategory = (category: StackCategory) => {
    setEditingCategory(category.id);
    setCategoryName(category.name);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Supprimer cette catégorie et tous ses éléments ?")) return;

    const res = await fetch(`/api/stack-categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchAll();
      setMessage("Catégorie supprimée.");
      if (itemForm.categoryId === id) {
        const remaining = sortedCategories.filter((c) => c.id !== id);
        setItemForm((prev) => ({ ...prev, categoryId: remaining[0]?.id ?? "" }));
      }
    }
  };

  const toggleCategoryVisible = async (category: StackCategory) => {
    const res = await fetch(`/api/stack-categories/${category.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !category.visible }),
    });

    if (res.ok) {
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, visible: !c.visible } : c))
      );
    }
  };

  const moveCategory = async (index: number, direction: "up" | "down") => {
    const list = [...sortedCategories];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= list.length) return;

    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];

    setCategories(list.map((c, idx) => ({ ...c, order: idx })));

    await fetch("/api/stack-categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: list.map((c) => c.id) }),
    });
  };

  const submitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.categoryId || !itemForm.label.trim()) return;

    setSaving(true);
    setMessage("");

    try {
      const url = editingItem ? `/api/stacks/${editingItem}` : "/api/stacks";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          techId: itemForm.techId,
          label: itemForm.label.trim(),
          categoryId: itemForm.categoryId,
        }),
      });

      if (!res.ok) throw new Error();

      await fetchAll();
      setEditingItem(null);
      setItemForm((prev) => ({
        ...prev,
        label: getTechById(prev.techId)?.label || "",
      }));
      setMessage(editingItem ? "Élément mis à jour." : "Élément ajouté.");
    } catch {
      setMessage("Erreur lors de la sauvegarde de l'élément.");
    } finally {
      setSaving(false);
    }
  };

  const editItem = (item: StackItem) => {
    setEditingItem(item.id);
    setItemForm({
      techId: item.techId,
      label: item.label,
      categoryId: item.categoryId,
    });
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Supprimer cet élément de stack ?")) return;

    const res = await fetch(`/api/stacks/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchAll();
      setMessage("Élément supprimé.");
    }
  };

  const toggleItemVisible = async (item: StackItem) => {
    const res = await fetch(`/api/stacks/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !item.visible }),
    });

    if (res.ok) {
      setCategories((prev) =>
        prev.map((category) => {
          if (category.id !== item.categoryId) return category;
          return {
            ...category,
            items: category.items.map((i) =>
              i.id === item.id ? { ...i, visible: !i.visible } : i
            ),
          };
        })
      );
    }
  };

  const moveItem = async (
    categoryId: string,
    index: number,
    direction: "up" | "down"
  ) => {
    const category = sortedCategories.find((c) => c.id === categoryId);
    if (!category) return;

    const items = [...category.items].sort((a, b) => a.order - b.order);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= items.length) return;

    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: items.map((item, idx) => ({ ...item, order: idx })) }
          : cat
      )
    );

    await fetch("/api/stacks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: items.map((item) => item.id) }),
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Stacks techniques</h2>

        <div className="bg-white/5 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-200">Afficher la section sur le site</p>
              <p className="text-xs text-gray-500">Sous la section projets</p>
            </div>
            <button
              onClick={() => saveSettings({ stacksVisible: !settings.stacksVisible })}
              disabled={saving}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                settings.stacksVisible
                  ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                  : "bg-white/5 text-gray-500 hover:bg-white/10"
              }`}
            >
              {settings.stacksVisible ? "Visible" : "Masquée"}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={settings.stacksTitle}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, stacksTitle: e.target.value }))
              }
              className="input-glass"
              placeholder="Titre de section"
            />
            <button
              onClick={() => saveSettings({ stacksTitle: settings.stacksTitle })}
              className="btn-secondary text-sm"
              disabled={saving}
            >
              Enregistrer le titre
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-300">Domaines / catégories</h3>

          <div className="space-y-2">
            {sortedCategories.map((category, index) => (
              <div key={category.id} className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        onClick={() => moveCategory(index, "up")}
                        disabled={index === 0}
                        className="w-6 h-6 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 disabled:opacity-20"
                        title="Monter"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveCategory(index, "down")}
                        disabled={index === sortedCategories.length - 1}
                        className="w-6 h-6 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 disabled:opacity-20"
                        title="Descendre"
                      >
                        ↓
                      </button>
                    </div>
                    <p className="text-sm text-white truncate">{category.name}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCategoryVisible(category)}
                      className={`px-2 py-1 text-xs rounded ${
                        category.visible
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-white/5 text-gray-500"
                      }`}
                    >
                      {category.visible ? "Visible" : "Masquée"}
                    </button>
                    <button
                      onClick={() => editCategory(category)}
                      className="px-2 py-1 text-xs rounded bg-indigo-500/20 text-indigo-300"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-300"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={submitCategory} className="space-y-3 border-t border-white/10 pt-4">
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Nom du domaine (ex: Frameworks)"
              className="input-glass"
              required
            />
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                {editingCategory ? "Mettre à jour" : "Ajouter catégorie"}
              </button>
              {editingCategory && (
                <button
                  type="button"
                  className="btn-secondary text-sm"
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryName("");
                  }}
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-300">Éléments de stack</h3>

          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
            {sortedCategories.map((category) => {
              const sortedItems = [...category.items].sort((a, b) => a.order - b.order);
              return (
                <div key={category.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-3">
                  <p className="text-sm text-gray-200 mb-2">{category.name}</p>
                  <div className="space-y-2">
                    {sortedItems.length === 0 && (
                      <p className="text-xs text-gray-500">Aucun élément.</p>
                    )}
                    {sortedItems.map((item, index) => {
                      const tech = getTechById(item.techId);
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between gap-2 bg-white/5 rounded-lg px-2 py-2 ${
                            !item.visible ? "opacity-50" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex flex-col gap-0.5 shrink-0">
                              <button
                                onClick={() => moveItem(category.id, index, "up")}
                                disabled={index === 0}
                                className="w-5 h-5 rounded bg-white/5 disabled:opacity-20"
                                title="Monter"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => moveItem(category.id, index, "down")}
                                disabled={index === sortedItems.length - 1}
                                className="w-5 h-5 rounded bg-white/5 disabled:opacity-20"
                                title="Descendre"
                              >
                                ↓
                              </button>
                            </div>
                            {tech && (
                              <span className="w-4 h-4" style={{ color: tech.color }}>
                                {tech.icon}
                              </span>
                            )}
                            <p className="text-xs text-gray-200 truncate">{item.label}</p>
                          </div>

                          <div className="flex gap-1">
                            <button
                              onClick={() => toggleItemVisible(item)}
                              className={`px-2 py-1 text-[11px] rounded ${
                                item.visible
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-white/5 text-gray-500"
                              }`}
                            >
                              {item.visible ? "Visible" : "Masqué"}
                            </button>
                            <button
                              onClick={() => editItem(item)}
                              className="px-2 py-1 text-[11px] rounded bg-indigo-500/20 text-indigo-300"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="px-2 py-1 text-[11px] rounded bg-red-500/20 text-red-300"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={submitItem} className="space-y-3 border-t border-white/10 pt-4">
            <select
              className="select-glass"
              value={itemForm.categoryId}
              onChange={(e) => setItemForm((prev) => ({ ...prev, categoryId: e.target.value }))}
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {sortedCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              className="select-glass"
              value={itemForm.techId}
              onChange={(e) => {
                const tech = getTechById(e.target.value);
                setItemForm((prev) => ({
                  ...prev,
                  techId: e.target.value,
                  label: tech?.label ?? prev.label,
                }));
              }}
              required
            >
              {TECH_LIST.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={itemForm.label}
              onChange={(e) => setItemForm((prev) => ({ ...prev, label: e.target.value }))}
              placeholder="Label affiché"
              className="input-glass"
              required
            />

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                {editingItem ? "Mettre à jour" : "Ajouter élément"}
              </button>
              {editingItem && (
                <button
                  type="button"
                  className="btn-secondary text-sm"
                  onClick={() => {
                    setEditingItem(null);
                    setItemForm((prev) => ({
                      ...prev,
                      label: getTechById(prev.techId)?.label || "",
                    }));
                  }}
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {message && (
        <p className={`text-sm ${message.includes("Erreur") ? "text-red-400" : "text-green-400"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
