"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type DishOption = {
  id: string;
  title: string;
  imageUrl: string | null;
};

type Props = {
  menuDayId: string;
  dishes: DishOption[];
  existingDishIds: string[];
};

type Category = "MAIN" | "VEG" | "SOUP" | "DESSERT" | "OTHER";

export function AddMenuItem({ menuDayId, dishes, existingDishIds }: Props) {
  const [dishId, setDishId] = useState("");
  const [price, setPrice] = useState(50);
  const [category, setCategory] = useState<Category>("MAIN");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const availableDishes = useMemo(() => {
    const blocked = new Set(existingDishIds);
    return dishes.filter((dish) => !blocked.has(dish.id));
  }, [dishes, existingDishIds]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredDishes = useMemo(() => {
    if (!normalizedQuery) return availableDishes;
    return availableDishes.filter((dish) => dish.title.toLowerCase().includes(normalizedQuery));
  }, [availableDishes, normalizedQuery]);

  const selectedDish = useMemo(
    () => dishes.find((dish) => dish.id === dishId) ?? null,
    [dishes, dishId]
  );

  useEffect(() => {
    if (!dishId) return;
    if (!availableDishes.some((dish) => dish.id === dishId)) {
      setDishId("");
    }
  }, [availableDishes, dishId]);

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      searchInputRef.current?.focus();
    }
  }, [open]);

  const handleAdd = async () => {
    if (!dishId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuDayId,
          dishId,
          price: Number.isFinite(price) ? Math.max(0, price) : 0,
          category,
        }),
      });

      if (res.ok) {
        setDishId("");
        setQuery("");
        setOpen(false);
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

  const noChoices = availableDishes.length === 0;

  return (
    <div className="flex items-end gap-2 flex-wrap border-t border-gray-100 pt-3">
      <div className="flex-1 min-w-[260px] relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => {
            if (noChoices) return;
            setOpen((value) => !value);
          }}
          disabled={noChoices}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-left flex items-center justify-between disabled:bg-gray-50 disabled:text-gray-400"
          aria-expanded={open}
        >
          <span className="truncate">
            {selectedDish?.title ?? "Velg rett..."}
          </span>
          <span className="text-gray-400">▾</span>
        </button>

        {open && (
          <div className="absolute z-40 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <input
                ref={searchInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Søk etter rett..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="max-h-64 overflow-auto">
              {filteredDishes.length === 0 ? (
                <p className="px-3 py-3 text-sm text-gray-500">Ingen treff</p>
              ) : (
                filteredDishes.map((dish) => (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => {
                      setDishId(dish.id);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                      dish.id === dishId ? "bg-emerald-50" : ""
                    }`}
                  >
                    {dish.imageUrl ? (
                      <img
                        src={dish.imageUrl}
                        alt={dish.title}
                        className="w-8 h-8 rounded-md object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-gray-200 text-gray-500 border border-gray-200 flex items-center justify-center text-xs font-semibold">
                        {dish.title.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <span className="truncate">{dish.title}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {noChoices && (
          <p className="text-xs text-gray-500 mt-1">
            Ingen flere retter tilgjengelig for denne dagen.
          </p>
        )}
      </div>

      <div className="w-20">
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => {
            const parsed = Number.parseInt(e.target.value, 10);
            setPrice(Number.isNaN(parsed) ? 0 : parsed);
          }}
          className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm"
          placeholder="Pris"
        />
      </div>

      <div className="w-28">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
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
