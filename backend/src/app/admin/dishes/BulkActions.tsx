"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, CheckSquare } from "lucide-react";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

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
  const [showModal, setShowModal] = useState(false);
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
        setShowModal(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white rounded-2xl shadow-xl border border-gray-200 px-5 py-3 flex items-center gap-4">
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

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Slett valgte
        </button>
      </div>

      {showModal && (
        <DeleteConfirmModal
          title={`Slette ${selectedIds.length} retter?`}
          description={`${selectedIds.length} valgte retter vil bli permanent slettet. Denne handlingen kan ikke angres.`}
          warnings={warnings}
          loading={loading}
          onConfirm={handleDelete}
          onCancel={() => { setShowModal(false); setWarnings([]); }}
        />
      )}
    </>
  );
}
