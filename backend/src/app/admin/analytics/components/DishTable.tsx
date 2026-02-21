"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Flame, ChevronDown } from "lucide-react";

type DishData = {
  dish: string;
  imageUrl: string | null;
  up: number;
  mid: number;
  down: number;
  total: number;
  score: number;
  positivePct: number;
  history: { date: string; up: number; mid: number; down: number; total: number }[];
};

type Tab = "top" | "most" | "worst";

export function DishTable({ dishes }: { dishes: DishData[] }) {
  const [tab, setTab] = useState<Tab>("top");
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = [...dishes];
  if (tab === "top") sorted.sort((a, b) => b.score - a.score);
  else if (tab === "most") sorted.sort((a, b) => b.total - a.total);
  else sorted.sort((a, b) => a.score - b.score);

  const displayed = sorted.slice(0, 10);

  const tabs: { id: Tab; label: string; icon: typeof ThumbsUp }[] = [
    { id: "top", label: "Topp", icon: ThumbsUp },
    { id: "most", label: "Mest stemt", icon: Flame },
    { id: "worst", label: "Bunn", icon: ThumbsDown },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-5">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? t.id === "worst"
                    ? "bg-red-100 text-red-700"
                    : "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {displayed.map((dish, i) => {
          const isExpanded = expanded === dish.dish;
          const accent =
            tab === "worst" ? "text-red-500" : "text-emerald-600";

          return (
            <div key={dish.dish}>
              <button
                onClick={() =>
                  setExpanded(isExpanded ? null : dish.dish)
                }
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl w-full text-left hover:bg-gray-100 transition-colors"
              >
                <span className={`text-sm font-bold w-6 ${accent}`}>
                  {i + 1}
                </span>
                {dish.imageUrl ? (
                  <img
                    src={dish.imageUrl}
                    alt={dish.dish}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-sm font-bold">
                    {dish.dish.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {dish.dish}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="flex h-1.5 rounded-full overflow-hidden w-24 bg-gray-200">
                      {dish.up > 0 && (
                        <div
                          className="bg-emerald-400 h-full"
                          style={{
                            width: `${(dish.up / dish.total) * 100}%`,
                          }}
                        />
                      )}
                      {dish.mid > 0 && (
                        <div
                          className="bg-amber-400 h-full"
                          style={{
                            width: `${(dish.mid / dish.total) * 100}%`,
                          }}
                        />
                      )}
                      {dish.down > 0 && (
                        <div
                          className="bg-red-400 h-full"
                          style={{
                            width: `${(dish.down / dish.total) * 100}%`,
                          }}
                        />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">
                      😀{dish.up} 😐{dish.mid} 😞{dish.down}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-sm font-bold ${accent}`}>
                    {dish.positivePct}%
                  </div>
                  <div className="text-xs text-gray-400">
                    {dish.total} stemmer
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>

              {isExpanded && dish.history.length > 0 && (
                <div className="ml-10 mt-1 mb-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-xs font-medium text-gray-500 mb-2">
                    Historikk
                  </div>
                  <div className="space-y-1.5">
                    {dish.history.map((h) => {
                      const hPct =
                        h.total > 0
                          ? Math.round((h.up / h.total) * 100)
                          : 0;
                      return (
                        <div
                          key={h.date}
                          className="flex items-center gap-3 text-xs"
                        >
                          <span className="text-gray-500 w-20">
                            {h.date}
                          </span>
                          <div className="flex h-1.5 rounded-full overflow-hidden w-16 bg-gray-200">
                            {h.up > 0 && (
                              <div
                                className="bg-emerald-400"
                                style={{
                                  width: `${(h.up / h.total) * 100}%`,
                                }}
                              />
                            )}
                            {h.mid > 0 && (
                              <div
                                className="bg-amber-400"
                                style={{
                                  width: `${(h.mid / h.total) * 100}%`,
                                }}
                              />
                            )}
                            {h.down > 0 && (
                              <div
                                className="bg-red-400"
                                style={{
                                  width: `${(h.down / h.total) * 100}%`,
                                }}
                              />
                            )}
                          </div>
                          <span className="text-gray-400">
                            {h.total} stemmer · {hPct}% positiv
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {displayed.length === 0 && (
          <p className="text-gray-400 text-center py-8 text-sm">
            Ingen data å vise
          </p>
        )}
      </div>
    </div>
  );
}
