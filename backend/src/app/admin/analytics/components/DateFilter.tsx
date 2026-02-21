"use client";

import { Calendar, Filter } from "lucide-react";
import { startOfISOWeek, subDays, format } from "date-fns";

type Preset = { label: string; from?: string; to?: string };

const presets: Preset[] = [
  {
    label: "Denne uken",
    from: format(startOfISOWeek(new Date()), "yyyy-MM-dd"),
  },
  {
    label: "Siste 30 dager",
    from: format(subDays(new Date(), 30), "yyyy-MM-dd"),
  },
  {
    label: "Denne måneden",
    from: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"),
  },
  { label: "Alt" },
];

export function DateFilter({
  from,
  to,
  onChange,
}: {
  from?: string;
  to?: string;
  onChange: (from?: string, to?: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Filter className="w-4 h-4 text-gray-400" />
      {presets.map((p) => {
        const active = from === p.from && !to && !p.to;
        const allActive = !from && !to && !p.from;
        const isActive = active || allActive;
        return (
          <button
            key={p.label}
            onClick={() => onChange(p.from, p.to)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {p.label}
          </button>
        );
      })}
      <span className="mx-1 text-gray-300">|</span>
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-gray-400" />
        <input
          type="date"
          value={from ?? ""}
          onChange={(e) => onChange(e.target.value || undefined, to)}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs"
        />
        <span className="text-xs text-gray-400">–</span>
        <input
          type="date"
          value={to ?? ""}
          onChange={(e) => onChange(from, e.target.value || undefined)}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs"
        />
      </div>
    </div>
  );
}
