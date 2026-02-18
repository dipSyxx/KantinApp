"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  menuItemId: string;
  dishTitle: string;
  voteCount: number;
};

export function DeleteMenuItemButton({ menuItemId, dishTitle, voteCount }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const message =
      voteCount > 0
        ? `Er du sikker på at du vil fjerne "${dishTitle}"? ${voteCount} stemme${
            voteCount === 1 ? "" : "r"
          } blir også slettet.`
        : `Er du sikker på at du vil fjerne "${dishTitle}" fra denne dagen?`;

    if (!confirm(message)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/menu-items/${menuItemId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
        return;
      }

      try {
        const data = await res.json();
        alert(data.message ?? "Kunne ikke fjerne retten.");
      } catch {
        alert("Kunne ikke fjerne retten.");
      }
    } catch {
      alert("Nettverksfeil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors font-semibold"
    >
      {loading ? "..." : "Fjern"}
    </button>
  );
}
