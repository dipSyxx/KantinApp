"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarPlus, Search } from "lucide-react";

type WeekData = {
  id: string;
  year: number;
  weekNumber: number;
  status: string;
  publishedAt: string | null;
  totalItems: number;
  filledDays: number;
  totalDays: number;
  dateRange: string;
  isCurrent: boolean;
  days: { id: string; dayOfWeek: number; itemCount: number }[];
};

const statusOptions = [
  { value: "ALL", label: "Alle" },
  { value: "DRAFT", label: "Utkast" },
  { value: "PUBLISHED", label: "Publisert" },
  { value: "ARCHIVED", label: "Arkivert" },
];

export function WeekFilter({
  years,
  weeks,
}: {
  years: number[];
  weeks: WeekData[];
}) {
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = weeks.filter((w) => {
    if (yearFilter && w.year !== yearFilter) return false;
    if (statusFilter !== "ALL" && w.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const text = `uke ${w.weekNumber} ${w.year} ${w.dateRange}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  const dayNames = ["søn.", "man.", "tir.", "ons.", "tor.", "fre.", "lør."];

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Søk uke..."
            className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-40"
          />
        </div>

        <select
          value={yearFilter ?? ""}
          onChange={(e) =>
            setYearFilter(e.target.value ? Number(e.target.value) : null)
          }
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
        >
          <option value="">Alle år</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === opt.value
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.map((wm) => (
          <Link
            key={wm.id}
            href={`/admin/weeks/${wm.id}`}
            className={`block bg-white rounded-2xl shadow-sm border p-6 hover:border-emerald-200 transition-colors ${
              wm.isCurrent
                ? "border-emerald-300 ring-1 ring-emerald-200"
                : "border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">
                    Uke {wm.weekNumber}, {wm.year}
                  </h2>
                  {wm.isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      Denne uken
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {wm.dateRange} · {wm.totalDays} dager · {wm.totalItems}{" "}
                  retter
                  {wm.publishedAt &&
                    ` · Publisert ${new Date(wm.publishedAt).toLocaleDateString("no-NO")}`}
                </p>
              </div>
              <StatusBadge status={wm.status} />
            </div>

            {/* Progress bar */}
            {wm.totalDays > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all"
                    style={{
                      width: `${(wm.filledDays / wm.totalDays) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  {wm.filledDays}/{wm.totalDays} dager
                </span>
              </div>
            )}

            {/* Day summary */}
            <div className="flex gap-2 mt-3">
              {wm.days.map((day) => (
                <div
                  key={day.id}
                  className={`flex-1 rounded-lg p-2 text-center ${
                    day.itemCount > 0 ? "bg-emerald-50" : "bg-gray-50"
                  }`}
                >
                  <div className="text-xs text-gray-500">
                    {dayNames[day.dayOfWeek]}
                  </div>
                  <div
                    className={`text-sm font-bold ${
                      day.itemCount > 0 ? "text-emerald-600" : "text-gray-300"
                    }`}
                  >
                    {day.itemCount}
                  </div>
                </div>
              ))}
            </div>
          </Link>
        ))}

        {filtered.length === 0 && weeks.length > 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Ingen ukemenyer matcher filteret
          </div>
        )}

        {weeks.length === 0 && (
          <div className="text-center py-16">
            <CalendarPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-1">
              Ingen ukemenyer ennå
            </h3>
            <p className="text-sm text-gray-400">
              Opprett den første ukemenyen ovenfor for å komme i gang.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-yellow-100 text-yellow-800",
    PUBLISHED: "bg-emerald-100 text-emerald-800",
    ARCHIVED: "bg-gray-100 text-gray-600",
  };
  const labels: Record<string, string> = {
    DRAFT: "Utkast",
    PUBLISHED: "Publisert",
    ARCHIVED: "Arkivert",
  };
  return (
    <span
      className={`text-xs font-bold px-3 py-1 rounded-full ${styles[status] ?? "bg-gray-100"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
