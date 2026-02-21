"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

type Category = "MAIN" | "VEG" | "SOUP" | "DESSERT" | "OTHER";

const categoryColors: Record<string, string> = {
  MAIN: "bg-emerald-100 text-emerald-700",
  VEG: "bg-lime-100 text-lime-700",
  SOUP: "bg-orange-100 text-orange-700",
  DESSERT: "bg-pink-100 text-pink-700",
  OTHER: "bg-gray-100 text-gray-600",
};

const categoryLabels: Record<string, string> = {
  MAIN: "Hovedrett",
  VEG: "Vegetar",
  SOUP: "Suppe",
  DESSERT: "Dessert",
  OTHER: "Annet",
};

export function EditMenuItemInline({
  menuItemId,
  initialPrice,
  initialCategory,
  canEdit,
}: {
  menuItemId: string;
  initialPrice: number;
  initialCategory: string;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(initialPrice);
  const [category, setCategory] = useState<Category>(
    initialCategory as Category
  );
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  if (!canEdit) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">{initialPrice} kr</span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded font-medium ${categoryColors[initialCategory] ?? "bg-gray-100"}`}
        >
          {categoryLabels[initialCategory] ?? initialCategory}
        </span>
      </div>
    );
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-1 -mx-1 py-0.5 transition-colors"
        title="Klikk for å redigere"
      >
        <span className="text-xs text-gray-500">{initialPrice} kr</span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded font-medium ${categoryColors[initialCategory] ?? "bg-gray-100"}`}
        >
          {categoryLabels[initialCategory] ?? initialCategory}
        </span>
      </button>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/menu-items/${menuItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price, category }),
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={0}
        value={price}
        onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
        className="w-16 border border-gray-300 rounded-md px-1.5 py-0.5 text-xs"
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        autoFocus
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as Category)}
        className="border border-gray-300 rounded-md px-1 py-0.5 text-xs bg-white"
      >
        <option value="MAIN">Hovedrett</option>
        <option value="VEG">Vegetar</option>
        <option value="SOUP">Suppe</option>
        <option value="DESSERT">Dessert</option>
        <option value="OTHER">Annet</option>
      </select>
      <button
        onClick={handleSave}
        disabled={saving}
        className="p-0.5 rounded text-emerald-600 hover:bg-emerald-50"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => {
          setPrice(initialPrice);
          setCategory(initialCategory as Category);
          setEditing(false);
        }}
        className="p-0.5 rounded text-gray-400 hover:bg-gray-100"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
