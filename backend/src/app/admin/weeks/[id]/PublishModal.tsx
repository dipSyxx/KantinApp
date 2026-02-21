"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";

type DayInfo = {
  dayName: string;
  itemCount: number;
  isOpen: boolean;
};

export function PublishModal({
  weekMenuId,
  weekLabel,
  days,
  onClose,
}: {
  weekMenuId: string;
  weekLabel: string;
  days: DayInfo[];
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const hasWarnings = days.some((d) => d.isOpen && d.itemCount === 0);

  const handlePublish = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/week-menu/${weekMenuId}/publish`, {
        method: "POST",
      });
      if (res.ok) {
        onClose();
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message ?? "Feil ved publisering");
      }
    } catch {
      alert("Nettverksfeil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Publiser {weekLabel}?</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 mb-6">
          {days.map((day) => {
            const ok = !day.isOpen || day.itemCount > 0;
            return (
              <div
                key={day.dayName}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  ok ? "bg-gray-50" : "bg-amber-50 border border-amber-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                  <span className="text-sm font-medium">{day.dayName}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {!day.isOpen ? (
                    <span className="text-gray-400">Stengt</span>
                  ) : day.itemCount > 0 ? (
                    `${day.itemCount} retter`
                  ) : (
                    <span className="text-amber-600 font-medium">
                      Ingen retter!
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {hasWarnings && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800">
            Noen åpne dager har ingen retter. Elever vil se en tom meny for
            disse dagene.
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Avbryt
          </button>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Publiserer..." : "Publiser"}
          </button>
        </div>
      </div>
    </div>
  );
}
