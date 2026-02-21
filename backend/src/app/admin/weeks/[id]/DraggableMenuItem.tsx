"use client";

import { useState, type DragEvent, type ReactNode } from "react";
import { GripVertical } from "lucide-react";

export function DraggableMenuItem({
  itemId,
  sortOrder,
  children,
  onReorder,
}: {
  itemId: string;
  sortOrder: number;
  children: ReactNode;
  onReorder: (draggedId: string, targetId: string) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer.setData("text/plain", itemId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId && draggedId !== itemId) {
      onReorder(draggedId, itemId);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex items-center gap-1 transition-all ${
        isDragOver ? "ring-2 ring-emerald-300 rounded-xl" : ""
      }`}
    >
      <div className="cursor-grab active:cursor-grabbing p-1 text-gray-300 hover:text-gray-500">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
