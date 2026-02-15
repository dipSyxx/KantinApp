import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  // Compute stats
  const [totalVotes, totalDishes, totalMenuItems] = await Promise.all([
    prisma.vote.count(),
    prisma.dish.count(),
    prisma.menuItem.count(),
  ]);

  // Top rated dishes
  const menuItemsWithVotes = await prisma.menuItem.findMany({
    where: { votes: { some: {} } },
    include: {
      dish: { select: { title: true, imageUrl: true } },
      menuDay: { select: { date: true } },
      votes: { select: { value: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const dishStats = new Map<
    string,
    { title: string; imageUrl: string | null; up: number; mid: number; down: number; total: number }
  >();

  for (const item of menuItemsWithVotes) {
    const existing = dishStats.get(item.dish.title) ?? {
      title: item.dish.title,
      imageUrl: item.dish.imageUrl,
      up: 0,
      mid: 0,
      down: 0,
      total: 0,
    };

    for (const v of item.votes) {
      existing.total++;
      if (v.value === 1) existing.up++;
      else if (v.value === 0) existing.mid++;
      else if (v.value === -1) existing.down++;
    }

    dishStats.set(item.dish.title, existing);
  }

  const topDishes = [...dishStats.values()]
    .map((d) => ({
      ...d,
      score: d.total > 0 ? (d.up - d.down) / d.total : 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Analyse</h1>
        <a
          href="/api/admin/analytics?format=csv"
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Last ned CSV
        </a>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Totale stemmer" value={totalVotes} />
        <StatCard title="Unike retter" value={totalDishes} />
        <StatCard title="Menypunkter" value={totalMenuItems} />
      </div>

      {/* Top dishes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-4">Topp retter (etter score)</h2>
        <div className="space-y-3">
          {topDishes.map((dish, index) => {
            const pct = dish.total > 0 ? Math.round((dish.up / dish.total) * 100) : 0;

            return (
              <div
                key={dish.title}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
              >
                <span className="text-lg font-bold text-gray-300 w-6">
                  {index + 1}
                </span>
                {dish.imageUrl && (
                  <img
                    src={dish.imageUrl}
                    alt={dish.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="font-medium text-sm">{dish.title}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">
                      😀 {dish.up} · 😐 {dish.mid} · 😞 {dish.down}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-600">
                    {pct}% positive
                  </div>
                  <div className="text-xs text-gray-400">
                    {dish.total} stemmer
                  </div>
                </div>
              </div>
            );
          })}

          {topDishes.length === 0 && (
            <p className="text-gray-400 text-center py-8">
              Ingen stemmer registrert ennå
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="text-sm text-gray-500 font-medium">{title}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
