"use client";

import { useState, useEffect } from "react";
import { X, ThumbsUp, ThumbsDown, Minus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

type UsageEntry = {
  menuItemId: string;
  date: string;
  weekLabel: string;
  weekStatus: string;
  price: number;
  category: string;
  totalVotes: number;
  positiveVotes: number;
  avgRating: number | null;
};

export function DishUsageModal({
  dishId,
  dishTitle,
  onClose,
}: {
  dishId: string;
  dishTitle: string;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<UsageEntry[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/dishes/${dishId}/usage`);
        if (res.ok) {
          const data = await res.json();
          setUsage(data.usage);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [dishId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base">Brukshistorikk</h3>
            <p className="text-sm text-gray-500">{dishTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : usage.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">
              Denne retten har ikke blitt brukt i noen menyer ennå.
            </p>
          ) : (
            <div className="space-y-2">
              {usage.map((entry) => {
                const ratingColor =
                  entry.avgRating === null
                    ? "text-gray-400"
                    : entry.avgRating > 0.3
                      ? "text-emerald-600"
                      : entry.avgRating < -0.3
                        ? "text-red-500"
                        : "text-amber-500";

                return (
                  <div
                    key={entry.menuItemId}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {entry.weekLabel}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(entry.date), "EEEE d. MMMM yyyy", { locale: nb })}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {entry.price} kr
                    </div>
                    <div className="flex items-center gap-1.5">
                      {entry.totalVotes > 0 ? (
                        <>
                          <span className={`text-sm font-semibold ${ratingColor}`}>
                            {entry.avgRating !== null && entry.avgRating > 0.3 && (
                              <ThumbsUp className="w-3.5 h-3.5 inline mr-0.5" />
                            )}
                            {entry.avgRating !== null && entry.avgRating < -0.3 && (
                              <ThumbsDown className="w-3.5 h-3.5 inline mr-0.5" />
                            )}
                            {entry.avgRating !== null &&
                              entry.avgRating >= -0.3 &&
                              entry.avgRating <= 0.3 && (
                                <Minus className="w-3.5 h-3.5 inline mr-0.5" />
                              )}
                            {entry.totalVotes}
                          </span>
                          <span className="text-xs text-gray-400">stemmer</span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">Ingen stemmer</span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        entry.weekStatus === "PUBLISHED"
                          ? "bg-emerald-50 text-emerald-600"
                          : entry.weekStatus === "DRAFT"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {entry.weekStatus === "PUBLISHED"
                        ? "Publisert"
                        : entry.weekStatus === "DRAFT"
                          ? "Utkast"
                          : "Arkivert"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 text-right">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Lukk
          </button>
        </div>
      </div>
    </div>
  );
}
