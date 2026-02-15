import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [weekMenus, dishCount, voteCount, recentVotes] = await Promise.all([
    prisma.weekMenu.findMany({
      orderBy: [{ year: "desc" }, { weekNumber: "desc" }],
      take: 5,
      include: {
        days: {
          include: { _count: { select: { items: true } } },
        },
      },
    }),
    prisma.dish.count(),
    prisma.vote.count(),
    prisma.vote.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        menuItem: { include: { dish: { select: { title: true } } } },
        user: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Retter" value={dishCount} icon="🍽️" />
        <StatCard title="Totale stemmer" value={voteCount} icon="🗳️" />
        <StatCard
          title="Ukemenyer"
          value={weekMenus.length}
          icon="📅"
        />
      </div>

      {/* Recent week menus */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Siste ukemenyer</h2>
          <Link
            href="/admin/weeks"
            className="text-emerald-600 text-sm font-medium hover:underline"
          >
            Se alle →
          </Link>
        </div>
        <div className="space-y-3">
          {weekMenus.map((wm) => (
            <Link
              key={wm.id}
              href={`/admin/weeks/${wm.id}`}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div>
                <span className="font-semibold">
                  Uke {wm.weekNumber}, {wm.year}
                </span>
                <span className="text-gray-500 text-sm ml-2">
                  {wm.days.reduce((sum, d) => sum + d._count.items, 0)} retter
                </span>
              </div>
              <StatusBadge status={wm.status} />
            </Link>
          ))}
          {weekMenus.length === 0 && (
            <p className="text-gray-400 text-center py-4">
              Ingen ukemenyer opprettet ennå
            </p>
          )}
        </div>
      </div>

      {/* Recent votes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-4">Siste stemmer</h2>
        <div className="space-y-2">
          {recentVotes.map((vote) => (
            <div
              key={vote.id}
              className="flex items-center gap-3 text-sm p-2 rounded-lg"
            >
              <span className="text-lg">
                {vote.value === 1 ? "😀" : vote.value === 0 ? "😐" : "😞"}
              </span>
              <span className="font-medium">{vote.user.name}</span>
              <span className="text-gray-400">stemte på</span>
              <span className="text-gray-700">
                {vote.menuItem.dish.title}
              </span>
            </div>
          ))}
          {recentVotes.length === 0 && (
            <p className="text-gray-400 text-center py-4">
              Ingen stemmer ennå
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-gray-500 font-medium">{title}</span>
      </div>
      <span className="text-3xl font-bold">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-yellow-100 text-yellow-800",
    PUBLISHED: "bg-emerald-100 text-emerald-800",
    ARCHIVED: "bg-gray-100 text-gray-600",
  };

  const labels: Record<string, string> = {
    DRAFT: "Utkast",
    PUBLISHED: "Publisert",
    ARCHIVED: "Arkivert",
  };

  return (
    <span
      className={`text-xs font-bold px-2 py-1 rounded-full ${styles[status] ?? "bg-gray-100"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
