"use client";

import { X, Loader2, type LucideIcon } from "lucide-react";

export function ConfirmModal({
  icon: Icon,
  iconBg = "bg-blue-100",
  iconColor = "text-blue-600",
  title,
  description,
  confirmLabel = "Bekreft",
  confirmColor = "bg-blue-600 hover:bg-blue-700",
  loading,
  onConfirm,
  onCancel,
}: {
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmColor?: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
            <button
              onClick={onCancel}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Avbryt
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition-colors ${confirmColor}`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Icon className="w-4 h-4" />
            )}
            {loading ? "Vennligst vent..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
