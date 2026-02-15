"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  weekMenuId: string;
  status: string;
};

export function WeekActions({ weekMenuId, status }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePublish = async () => {
    if (!confirm("Er du sikker på at du vil publisere denne ukemenyen?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/week-menu/${weekMenuId}/publish`, {
        method: "POST",
      });
      if (res.ok) {
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

  const handleDelete = async () => {
    if (!confirm("Er du sikker på at du vil slette denne ukemenyen? Alle data slettes.")) return;

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

  return (
    <div className="flex gap-2">
      {status === "DRAFT" && (
        <button
          onClick={handlePublish}
          disabled={loading}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "..." : "Publiser"}
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors"
      >
        Slett
      </button>
    </div>
  );
}
