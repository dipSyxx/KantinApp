"use client";

import { Search, LayoutGrid, List, SlidersHorizontal } from "lucide-react";

export type SortOption = "newest" | "oldest" | "name-asc" | "name-desc" | "most-used";
export type ViewMode = "grid" | "list";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Nyeste først" },
  { value: "oldest", label: "Eldste først" },
  { value: "name-asc", label: "Navn A–Å" },
  { value: "name-desc", label: "Navn Å–A" },
  { value: "most-used", label: "Mest brukt" },
];

export function DishFilters({
  search,
  onSearchChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  allAllergens,
  activeAllergens,
  onToggleAllergen,
  allTags,
  activeTags,
  onToggleTag,
  showFilters,
  onToggleFilters,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  sort: SortOption;
  onSortChange: (v: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  allAllergens: string[];
  activeAllergens: string[];
  onToggleAllergen: (a: string) => void;
  allTags: string[];
  activeTags: string[];
  onToggleTag: (t: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}) {
  const hasActiveFilters = activeAllergens.length > 0 || activeTags.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Søk etter rett..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
          />
        </div>

        <button
          onClick={onToggleFilters}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
            showFilters || hasActiveFilters
              ? "bg-brand-green-50 text-brand-green border-brand-green/20"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtre
          {hasActiveFilters && (
            <span className="ml-0.5 w-5 h-5 rounded-full bg-brand-green text-white text-xs flex items-center justify-center">
              {activeAllergens.length + activeTags.length}
            </span>
          )}
        </button>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="flex border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 transition-colors ${
              viewMode === "grid"
                ? "bg-brand-green text-white"
                : "bg-white text-gray-400 hover:text-gray-600"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2 transition-colors ${
              viewMode === "list"
                ? "bg-brand-green text-white"
                : "bg-white text-gray-400 hover:text-gray-600"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
          {allAllergens.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Allergener</p>
              <div className="flex flex-wrap gap-1.5">
                {allAllergens.map((a) => {
                  const isActive = activeAllergens.includes(a);
                  return (
                    <button
                      key={a}
                      onClick={() => onToggleAllergen(a)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        isActive
                          ? "bg-red-100 text-red-700 border-red-200 font-semibold"
                          : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {allTags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((t) => {
                  const isActive = activeTags.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => onToggleTag(t)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all capitalize ${
                        isActive
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold"
                          : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {hasActiveFilters && (
            <button
              onClick={() => {
                activeAllergens.forEach(onToggleAllergen);
                activeTags.forEach(onToggleTag);
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Fjern alle filtre
            </button>
          )}
        </div>
      )}
    </div>
  );
}
