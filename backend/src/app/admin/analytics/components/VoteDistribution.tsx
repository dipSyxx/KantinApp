"use client";

export function VoteDistribution({
  up,
  mid,
  down,
}: {
  up: number;
  mid: number;
  down: number;
}) {
  const total = up + mid + down;
  if (total === 0) return null;

  const pctUp = Math.round((up / total) * 100);
  const pctMid = Math.round((mid / total) * 100);
  const pctDown = Math.round((down / total) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-semibold text-gray-500 mb-3">
        Stemmefordeling
      </h3>
      <div className="flex rounded-full overflow-hidden h-5 bg-gray-100">
        {up > 0 && (
          <div
            className="bg-emerald-400 transition-all duration-500"
            style={{ width: `${pctUp}%` }}
          />
        )}
        {mid > 0 && (
          <div
            className="bg-amber-400 transition-all duration-500"
            style={{ width: `${pctMid}%` }}
          />
        )}
        {down > 0 && (
          <div
            className="bg-red-400 transition-all duration-500"
            style={{ width: `${pctDown}%` }}
          />
        )}
      </div>
      <div className="flex items-center gap-6 mt-3 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-400" />
          😀 {pctUp}% ({up})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          😐 {pctMid}% ({mid})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          😞 {pctDown}% ({down})
        </span>
      </div>
    </div>
  );
}
