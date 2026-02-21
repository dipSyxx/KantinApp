"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check } from "lucide-react";

type DishOption = { id: string; title: string; imageUrl: string | null };
type Category = "MAIN" | "VEG" | "SOUP" | "DESSERT" | "OTHER";

export function BulkAddItems({
  menuDayId,
  dishes,
  existingDishIds,
}: {
  menuDayId: string;
  dishes: DishOption[];
  existingDishIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [price, setPrice] = useState(50);
  const [category, setCategory] = useState<Category>("MAIN");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const available = useMemo(() => {
    const blocked = new Set(existingDishIds);
    return dishes.filter((d) => !blocked.has(d.id));
  }, [dishes, existingDishIds]);

  const filtered = useMemo(() => {
    if (!query.trim()) return available;
    const q = query.trim().toLowerCase();
    return available.filter((d) => d.title.toLowerCase().includes(q));
  }, [available, query]);

  const toggleDish = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleSubmit = async () => {
    if (selected.size === 0) return;
    setLoading(true);
    try {
      for (const dishId of selected) {
        await fetch("/api/admin/menu-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ menuDayId, dishId, price, category }),
        });
      }
      setSelected(new Set());
      setOpen(false);
      setQuery("");
      router.refresh();
    } catch {
      alert("Nettverksfeil");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    if (available.length === 0) return null;
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1 mt-1"
      >
        <Plus className="w-3 h-3" />
        Legg til flere samtidig
      </button>
    );
  }

  return (
    <div className="border border-emerald-200 rounded-xl p-4 mt-3 bg-emerald-50/50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-emerald-800">
          Velg flere retter ({selected.size} valgt)
        </h4>
        <button
          onClick={() => {
            setOpen(false);
            setSelected(new Set());
            setQuery("");
          }}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Avbryt
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Søk etter retter..."
        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mb-2"
      />

      <div className="max-h-48 overflow-auto space-y-1 mb-3">
        {filtered.map((dish) => {
          const isSelected = selected.has(dish.id);
          return (
            <button
              key={dish.id}
              onClick={() => toggleDish(dish.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left transition-colors ${
                isSelected
                  ? "bg-emerald-100 text-emerald-800"
                  : "hover:bg-white"
              }`}
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                  isSelected
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-gray-300"
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
              {dish.imageUrl ? (
                <img
                  src={dish.imageUrl}
                  alt=""
                  className="w-6 h-6 rounded object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-400">
                  {dish.title.charAt(0)}
                </div>
              )}
              <span className="truncate">{dish.title}</span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-xs text-gray-400 py-2 text-center">Ingen treff</p>
        )}
      </div>

      <div className="flex items-end gap-2">
        <div>
          <label className="text-xs text-gray-600">Pris</label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
            className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">Kategori</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white"
          >
            <option value="MAIN">Hovedrett</option>
            <option value="VEG">Vegetar</option>
            <option value="SOUP">Suppe</option>
            <option value="DESSERT">Dessert</option>
            <option value="OTHER">Annet</option>
          </select>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || selected.size === 0}
          className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Legger til..." : `Legg til ${selected.size} retter`}
        </button>
      </div>
    </div>
  );
}
