"use client";

import { X } from "lucide-react";

type PreviewDay = {
  dayName: string;
  isOpen: boolean;
  items: {
    title: string;
    imageUrl: string | null;
    price: number;
    category: string;
  }[];
};

const categoryLabels: Record<string, string> = {
  MAIN: "Hovedrett",
  VEG: "Vegetar",
  SOUP: "Suppe",
  DESSERT: "Dessert",
  OTHER: "Annet",
};

const categoryColors: Record<string, string> = {
  MAIN: "bg-emerald-100 text-emerald-700",
  VEG: "bg-lime-100 text-lime-700",
  SOUP: "bg-orange-100 text-orange-700",
  DESSERT: "bg-pink-100 text-pink-700",
  OTHER: "bg-gray-100 text-gray-600",
};

export function PreviewModal({
  weekLabel,
  days,
  onClose,
}: {
  weekLabel: string;
  days: PreviewDay[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold">Forhåndsvisning</h3>
            <p className="text-sm text-gray-500">{weekLabel} — slik elevene ser det</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-auto p-6 pt-4 space-y-4">
          {days.map((day) => (
            <div key={day.dayName}>
              <h4 className="text-sm font-bold text-gray-700 mb-2 capitalize">
                {day.dayName}
              </h4>
              {!day.isOpen ? (
                <p className="text-sm text-gray-400 italic">Stengt</p>
              ) : day.items.length === 0 ? (
                <p className="text-sm text-gray-400 italic">
                  Ingen retter lagt til
                </p>
              ) : (
                <div className="space-y-2">
                  {day.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 font-bold">
                          {item.title.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${categoryColors[item.category] ?? "bg-gray-100"}`}
                          >
                            {categoryLabels[item.category] ?? item.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-gray-700">
                        {item.price} kr
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
