"use client";

import { useState, useMemo, useCallback } from "react";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { DishFilters, type SortOption, type ViewMode } from "./DishFilters";
import { DishCard } from "./DishCard";
import { BulkActions } from "./BulkActions";

export type SerializedDish = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  allergens: string[];
  tags: string[];
  createdAt: string;
  _count: { menuItems: number };
};

const PER_PAGE = 24;

export function DishList({ dishes }: { dishes: SerializedDish[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeAllergens, setActiveAllergens] = useState<string[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allAllergens = useMemo(() => {
    const set = new Set<string>();
    dishes.forEach((d) => d.allergens.forEach((a) => set.add(a)));
    return Array.from(set).sort();
  }, [dishes]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    dishes.forEach((d) => d.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [dishes]);

  const filtered = useMemo(() => {
    let result = [...dishes];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q)
      );
    }

    if (activeAllergens.length > 0) {
      result = result.filter((d) =>
        activeAllergens.some((a) =>
          d.allergens.some((da) => da.toLowerCase() === a.toLowerCase())
        )
      );
    }

    if (activeTags.length > 0) {
      result = result.filter((d) =>
        activeTags.some((t) =>
          d.tags.some((dt) => dt.toLowerCase() === t.toLowerCase())
        )
      );
    }

    switch (sort) {
      case "newest":
        result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case "oldest":
        result.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        break;
      case "name-asc":
        result.sort((a, b) => a.title.localeCompare(b.title, "nb"));
        break;
      case "name-desc":
        result.sort((a, b) => b.title.localeCompare(a.title, "nb"));
        break;
      case "most-used":
        result.sort((a, b) => b._count.menuItems - a._count.menuItems);
        break;
    }

    return result;
  }, [dishes, search, activeAllergens, activeTags, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const resetPage = useCallback(() => setPage(1), []);

  const toggleAllergen = (a: string) => {
    setActiveAllergens((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
    resetPage();
  };

  const toggleTag = (t: string) => {
    setActiveTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
    resetPage();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const exportCSV = () => {
    const header = "Navn;Beskrivelse;Bilde-URL;Allergener;Tags;Brukt i menyer;Opprettet";
    const rows = filtered.map((d) =>
      [
        `"${d.title}"`,
        `"${d.description ?? ""}"`,
        `"${d.imageUrl ?? ""}"`,
        `"${d.allergens.join(", ")}"`,
        `"${d.tags.join(", ")}"`,
        d._count.menuItems,
        d.createdAt.split("T")[0],
      ].join(";")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `retter-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <DishFilters
            search={search}
            onSearchChange={(v) => { setSearch(v); resetPage(); }}
            sort={sort}
            onSortChange={(v) => { setSort(v); resetPage(); }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            allAllergens={allAllergens}
            activeAllergens={activeAllergens}
            onToggleAllergen={toggleAllergen}
            allTags={allTags}
            activeTags={activeTags}
            onToggleTag={toggleTag}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters((p) => !p)}
          />
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          CSV
        </button>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400">
          Viser {paged.length} av {filtered.length} retter
          {filtered.length !== dishes.length && ` (filtrert fra ${dishes.length})`}
        </p>
      )}

      {paged.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">Ingen retter funnet med valgte filtre</p>
          <button
            onClick={() => {
              setSearch("");
              setActiveAllergens([]);
              setActiveTags([]);
              resetPage();
            }}
            className="text-sm text-brand-green hover:underline mt-2"
          >
            Fjern alle filtre
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              viewMode="grid"
              bulkMode={selectedIds.length > 0}
              isSelected={selectedIds.includes(dish.id)}
              onToggleSelect={() => toggleSelect(dish.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {paged.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              viewMode="list"
              bulkMode={selectedIds.length > 0}
              isSelected={selectedIds.includes(dish.id)}
              onToggleSelect={() => toggleSelect(dish.id)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
            .map((p, idx, arr) => (
              <span key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="text-gray-300 px-1">...</span>
                )}
                <button
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    p === safePage
                      ? "bg-brand-green text-white"
                      : "border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              </span>
            ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <BulkActions
        selectedIds={selectedIds}
        totalCount={filtered.length}
        onSelectAll={() => setSelectedIds(filtered.map((d) => d.id))}
        onClearSelection={() => setSelectedIds([])}
      />
    </div>
  );
}
