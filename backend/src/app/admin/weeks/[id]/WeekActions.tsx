"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Eye, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { PublishModal } from "./PublishModal";
import { PreviewModal } from "./PreviewModal";

type DayInfo = {
  dayName: string;
  itemCount: number;
  isOpen: boolean;
  items: {
    title: string;
    imageUrl: string | null;
    price: number;
    category: string;
  }[];
};

type Props = {
  weekMenuId: string;
  status: string;
  isEditMode: boolean;
  weekLabel: string;
  days: DayInfo[];
};

export function WeekActions({
  weekMenuId,
  status,
  isEditMode,
  weekLabel,
  days,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleArchive = async () => {
    if (!confirm("Er du sikker på at du vil arkivere denne ukemenyen?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/week-menu/${weekMenuId}/archive`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message ?? "Feil ved arkivering");
      }
    } catch {
      alert("Nettverksfeil");
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async () => {
    if (!confirm("Gjenopprette denne ukemenyen? Den vil bli publisert igjen."))
      return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/week-menu/${weekMenuId}/archive`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message ?? "Feil ved gjenoppretting");
      }
    } catch {
      alert("Nettverksfeil");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Er du sikker på at du vil slette denne ukemenyen? Alle data slettes."
      )
    )
      return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/week-menu/${weekMenuId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/weeks");
      } else {
        alert("Feil ved sletting");
      }
    } catch {
      alert("Nettverksfeil");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEdit = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isEditMode) {
      params.delete("edit");
    } else {
      params.set("edit", "1");
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {/* Preview */}
        <button
          onClick={() => setShowPreview(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Forhåndsvisning
        </button>

        {/* Edit toggle (published only) */}
        {status === "PUBLISHED" && (
          <button
            onClick={handleToggleEdit}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              isEditMode
                ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            {isEditMode ? "Avslutt redigering" : "Aktiver redigering"}
          </button>
        )}

        {/* Publish (draft only) */}
        {status === "DRAFT" && (
          <button
            onClick={() => setShowPublish(true)}
            disabled={loading}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            Publiser
          </button>
        )}

        {/* Archive (published only) */}
        {status === "PUBLISHED" && (
          <button
            onClick={handleArchive}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            <Archive className="w-4 h-4" />
            Arkiver
          </button>
        )}

        {/* Restore (archived only) */}
        {status === "ARCHIVED" && (
          <button
            onClick={handleUnarchive}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 transition-colors"
          >
            <ArchiveRestore className="w-4 h-4" />
            Gjenopprett
          </button>
        )}

        {/* Delete (draft and archived only) */}
        {(status === "DRAFT" || status === "ARCHIVED") && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Slett
          </button>
        )}
      </div>

      {/* Publish modal */}
      {showPublish && (
        <PublishModal
          weekMenuId={weekMenuId}
          weekLabel={weekLabel}
          days={days}
          onClose={() => setShowPublish(false)}
        />
      )}

      {/* Preview modal */}
      {showPreview && (
        <PreviewModal
          weekLabel={weekLabel}
          days={days}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
