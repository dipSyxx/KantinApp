"use client";

const categoryLabels: Record<string, string> = {
  MAIN: "Hovedrett",
  VEG: "Vegetar",
  SOUP: "Suppe",
  DESSERT: "Dessert",
  OTHER: "Annet",
};

type CatData = {
  category: string;
  up: number;
  mid: number;
  down: number;
  total: number;
};

export function CategoryBreakdown({ data }: { data: CatData[] }) {
  if (data.length === 0) return null;

  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-semibold text-gray-500 mb-4">
        Kategorioversikt
      </h3>
      <div className="space-y-4">
        {data.map((cat) => {
          const pct = cat.total > 0 ? Math.round((cat.up / cat.total) * 100) : 0;
          const barW = (cat.total / maxTotal) * 100;

          return (
            <div key={cat.category}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">
                  {categoryLabels[cat.category] ?? cat.category}
                </span>
                <span className="text-xs text-gray-400">
                  {cat.total} stemmer · {pct}% positiv
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full flex overflow-hidden transition-all duration-500"
                  style={{ width: `${barW}%` }}
                >
                  {cat.up > 0 && (
                    <div
                      className="bg-emerald-400 h-full"
                      style={{
                        width: `${(cat.up / cat.total) * 100}%`,
                      }}
                    />
                  )}
                  {cat.mid > 0 && (
                    <div
                      className="bg-amber-400 h-full"
                      style={{
                        width: `${(cat.mid / cat.total) * 100}%`,
                      }}
                    />
                  )}
                  {cat.down > 0 && (
                    <div
                      className="bg-red-400 h-full"
                      style={{
                        width: `${(cat.down / cat.total) * 100}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
