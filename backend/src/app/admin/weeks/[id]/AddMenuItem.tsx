"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  menuDayId: string;
  dishes: { id: string; title: string }[];
};

export function AddMenuItem({ menuDayId, dishes }: Props) {
  const [dishId, setDishId] = useState("");
  const [price, setPrice] = useState(50);
  const [category, setCategory] = useState("MAIN");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdd = async () => {
    if (!dishId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuDayId, dishId, price, category }),
      });

      if (res.ok) {
        setDishId("");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message ?? "Feil ved legge til");
      }
    } catch {
      alert("Nettverksfeil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-end gap-2 flex-wrap border-t border-gray-100 pt-3">
      <div className="flex-1 min-w-[200px]">
        <select
          value={dishId}
          onChange={(e) => setDishId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">Velg rett...</option>
          {dishes.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
      </div>
      <div className="w-20">
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm"
          placeholder="Pris"
        />
      </div>
      <div className="w-28">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm bg-white"
        >
          <option value="MAIN">Hovedrett</option>
          <option value="VEG">Vegetar</option>
          <option value="SOUP">Suppe</option>
          <option value="DESSERT">Dessert</option>
          <option value="OTHER">Annet</option>
        </select>
      </div>
      <button
        onClick={handleAdd}
        disabled={!dishId || loading}
        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "..." : "+ Legg til"}
      </button>
    </div>
  );
}
