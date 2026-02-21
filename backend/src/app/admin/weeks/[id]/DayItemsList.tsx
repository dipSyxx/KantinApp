"use client";

import { useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DraggableMenuItem } from "./DraggableMenuItem";

type Item = {
  id: string;
  sortOrder: number;
};

export function DayItemsList({
  items,
  canEdit,
  children,
}: {
  items: Item[];
  canEdit: boolean;
  children: ReactNode[];
}) {
  const router = useRouter();

  const handleReorder = useCallback(
    async (draggedId: string, targetId: string) => {
      const ids = items.map((it) => it.id);
      const fromIdx = ids.indexOf(draggedId);
      const toIdx = ids.indexOf(targetId);
      if (fromIdx === -1 || toIdx === -1) return;

      const reordered = [...ids];
      reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, draggedId);

      await Promise.all(
        reordered.map((id, i) =>
          fetch(`/api/admin/menu-items/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder: i }),
          })
        )
      );
      router.refresh();
    },
    [items, router]
  );

  if (!canEdit) {
    return <div className="space-y-2">{children}</div>;
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <DraggableMenuItem
          key={item.id}
          itemId={item.id}
          sortOrder={item.sortOrder}
          onReorder={handleReorder}
        >
          {children[i]}
        </DraggableMenuItem>
      ))}
    </div>
  );
}
