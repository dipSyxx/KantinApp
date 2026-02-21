"use client";

type DayData = {
  date: string;
  up: number;
  mid: number;
  down: number;
  total: number;
};

export function TrendChart({ data }: { data: DayData[] }) {
  if (data.length === 0) return null;

  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-semibold text-gray-500 mb-4">
        Stemmer over tid
      </h3>
      <div className="flex items-end gap-1 h-40">
        {data.map((day) => {
          const h = (day.total / maxTotal) * 100;
          const upH = day.total > 0 ? (day.up / day.total) * h : 0;
          const midH = day.total > 0 ? (day.mid / day.total) * h : 0;
          const downH = day.total > 0 ? (day.down / day.total) * h : 0;
          const label = day.date.slice(5);

          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-1 min-w-0"
            >
              <div
                className="w-full flex flex-col justify-end rounded-t-sm overflow-hidden"
                style={{ height: `${h}%` }}
                title={`${day.date}: ${day.total} stemmer`}
              >
                {upH > 0 && (
                  <div
                    className="bg-emerald-400 w-full"
                    style={{ height: `${(upH / h) * 100}%` }}
                  />
                )}
                {midH > 0 && (
                  <div
                    className="bg-amber-400 w-full"
                    style={{ height: `${(midH / h) * 100}%` }}
                  />
                )}
                {downH > 0 && (
                  <div
                    className="bg-red-400 w-full"
                    style={{ height: `${(downH / h) * 100}%` }}
                  />
                )}
              </div>
              <span className="text-[9px] text-gray-400 truncate w-full text-center">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
