"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";

type ExistingWeek = { id: string; year: number; weekNumber: number };

export function CreateWeekForm({
  existingWeeks,
}: {
  existingWeeks: ExistingWeek[];
}) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [week, setWeek] = useState(getISOWeek(new Date()));
  const [copyFromId, setCopyFromId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreate = async () => {
    setLoading(true);
    setError("");

    try {
      if (copyFromId) {
        const res = await fetch(`/api/admin/week-menu/${copyFromId}/copy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ year, weekNumber: week }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.message ?? "Kopiering feilet");
          return;
        }
      } else {
        const res = await fetch("/api/admin/week-menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ year, weekNumber: week }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.message ?? "Feil ved opprettelse");
          return;
        }
      }

      router.refresh();
    } catch {
      setError("Nettverksfeil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <h2 className="text-lg font-bold mb-4">Opprett ny ukemeny</h2>
      <div className="flex items-end gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            År
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 w-24 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Uke
          </label>
          <input
            type="number"
            min={1}
            max={53}
            value={week}
            onChange={(e) => setWeek(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 w-20 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <span className="inline-flex items-center gap-1">
              <Copy className="w-3 h-3" />
              Kopier fra
            </span>
          </label>
          <select
            value={copyFromId}
            onChange={(e) => setCopyFromId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white min-w-[180px]"
          >
            <option value="">Tom (ingen kopi)</option>
            {existingWeeks.map((w) => (
              <option key={w.id} value={w.id}>
                Uke {w.weekNumber}, {w.year}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading
            ? "Oppretter..."
            : copyFromId
              ? "Opprett med kopi"
              : "Opprett utkast"}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
    </div>
  );
}

function getISOWeek(date: Date): number {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}
