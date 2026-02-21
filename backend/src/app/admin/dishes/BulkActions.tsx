"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X, CheckSquare, Loader2 } from "lucide-react";

export function BulkActions({
  selectedIds,
  totalCount,
  onSelectAll,
  onClearSelection,
}: {
  selectedIds: string[];
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const router = useRouter();

  if (selectedIds.length === 0) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dishes/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.warnings?.length > 0) {
          setWarnings(data.warnings);
        }
        onClearSelection();
        router.refresh();
      }
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white rounded-2xl shadow-xl border border-gray-200 px-5 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-2">
        <CheckSquare className="w-4 h-4 text-brand-green" />
        <span className="text-sm font-medium">
          {selectedIds.length} av {totalCount} valgt
        </span>
      </div>

      <div className="h-5 w-px bg-gray-200" />

      <button
        onClick={onSelectAll}
        className="text-xs text-brand-green hover:text-brand-green-dark font-medium transition-colors"
      >
        Velg alle
      </button>

      <button
        onClick={onClearSelection}
        className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
      >
        Fjern valg
      </button>

      <div className="h-5 w-px bg-gray-200" />

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Slett valgte
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Bekreft
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs font-medium text-amber-700 mb-1">Advarsler:</p>
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-600">{w}</p>
          ))}
        </div>
      )}
    </div>
  );
}
