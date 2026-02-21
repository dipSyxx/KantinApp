"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DoorOpen, DoorClosed } from "lucide-react";

export function ToggleDayOpen({
  dayId,
  isOpen,
}: {
  dayId: string;
  isOpen: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(isOpen);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/menu-days/${dayId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: !open }),
      });
      if (res.ok) {
        setOpen(!open);
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        handleToggle();
      }}
      disabled={loading}
      title={open ? "Steng denne dagen" : "Åpne denne dagen"}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
        open
          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "bg-red-50 text-red-700 hover:bg-red-100"
      }`}
    >
      {open ? (
        <DoorOpen className="w-3.5 h-3.5" />
      ) : (
        <DoorClosed className="w-3.5 h-3.5" />
      )}
      {open ? "Åpen" : "Stengt"}
    </button>
  );
}
