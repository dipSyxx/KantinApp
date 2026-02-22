import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { currentISOWeek, nowOslo } from "@/lib/week";
import Link from "next/link";
import Image from "next/image";
import {
  UtensilsCrossed,
  Vote,
  CalendarDays,
  Users,
  TrendingUp,
  CheckCircle2,
  Plus,
  BarChart3,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { RelativeTime } from "./components/RelativeTime";
import { startOfISOWeek } from "date-fns";
import { nb } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";

export const dynamic = "force-dynamic";

async function resolveSchoolId(searchSchoolId?: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, schoolId: true },
  });
  if (!user) return null;

  if (user.role === "SUPER_ADMIN") {
    if (searchSchoolId) return searchSchoolId;
    const first = await prisma.school.findFirst({ orderBy: { name: "asc" }, select: { id: true } });
    return first?.id ?? null;
  }

  return user.schoolId;
}

type PageProps = {
  searchParams: Promise<{ schoolId?: string }>;
};

export default async function AdminDashboard({ searchParams }: PageProps) {
  const { schoolId: searchSchoolId } = await searchParams;
  const schoolId = await resolveSchoolId(searchSchoolId);

  if (!schoolId) {
    return <p className="text-gray-500 text-center py-12">Ingen skole tilknyttet kontoen din.</p>;
  }

  const { year, week } = currentISOWeek();
  const now = nowOslo();
  const weekStart = startOfISOWeek(now);

  const todayStr = formatInTimeZone(now, "Europe/Oslo", "yyyy-MM-dd");
  const todayDate = new Date(todayStr + "T12:00:00.000Z");

  const schoolFilter = { schoolId };

  const [
    weekMenus,
    dishCount,
    voteCount,
    recentVotes,
    userCount,
    usersThisWeek,
    votesThisWeek,
    publishedMenuCount,
    voteDistribution,
    todayMenu,
    currentWeekMenu,
    topDishes,
  ] = await Promise.all([
    prisma.weekMenu.findMany({
      where: schoolFilter,
      orderBy: [{ year: "desc" }, { weekNumber: "desc" }],
      take: 5,
      include: {
        days: {
          include: { _count: { select: { items: true } } },
        },
      },
    }),
    prisma.dish.count({ where: schoolFilter }),
    prisma.vote.count({ where: { menuItem: { menuDay: { weekMenu: schoolFilter } } } }),
    prisma.vote.findMany({
      where: { menuItem: { menuDay: { weekMenu: schoolFilter } } },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        menuItem: { include: { dish: { select: { title: true } } } },
        user: { select: { name: true } },
      },
    }),
    prisma.user.count({ where: schoolFilter }),
    prisma.user.count({ where: { ...schoolFilter, createdAt: { gte: weekStart } } }),
    prisma.vote.count({
      where: {
        createdAt: { gte: weekStart },
        menuItem: { menuDay: { weekMenu: schoolFilter } },
      },
    }),
    prisma.weekMenu.count({ where: { ...schoolFilter, status: "PUBLISHED" } }),
    prisma.vote.groupBy({
      by: ["value"],
      _count: { _all: true },
      where: { menuItem: { menuDay: { weekMenu: schoolFilter } } },
    }),
    prisma.menuDay.findFirst({
      where: {
        date: todayDate,
        weekMenu: { ...schoolFilter, status: "PUBLISHED" },
      },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: {
            dish: { select: { title: true, imageUrl: true } },
            _count: { select: { votes: true } },
          },
        },
      },
    }),
    prisma.weekMenu.findUnique({
      where: { year_weekNumber_schoolId: { year, weekNumber: week, schoolId } },
    }),
    prisma.$queryRaw<
      { dishTitle: string; score: number; total: number }[]
    >`
      SELECT d."title" AS "dishTitle",
             SUM(v."value")::int AS score,
             COUNT(v."id")::int AS total
      FROM votes v
      JOIN menu_items mi ON mi.id = v."menuItemId"
      JOIN dishes d ON d.id = mi."dishId"
      WHERE v."createdAt" >= ${weekStart}
        AND d."schoolId" = ${schoolId}
      GROUP BY d.id, d.title
      HAVING COUNT(v.id) >= 1
      ORDER BY SUM(v."value")::float / COUNT(v.id) DESC
    `,
  ]);

  const voteDist = {
    good: voteDistribution.find((v) => v.value === 1)?._count._all ?? 0,
    ok: voteDistribution.find((v) => v.value === 0)?._count._all ?? 0,
    bad: voteDistribution.find((v) => v.value === -1)?._count._all ?? 0,
  };
  const voteTotal = voteDist.good + voteDist.ok + voteDist.bad;

  const top3 = topDishes.slice(0, 3);
  const bottom3 = [...topDishes].reverse().slice(0, 3);

  const categoryLabels: Record<string, string> = {
    MAIN: "Hovedrett",
    VEG: "Vegetar",
    SOUP: "Suppe",
    DESSERT: "Dessert",
    OTHER: "Annet",
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {currentWeekMenu ? (
        <Link
          href={`/admin/weeks/${currentWeekMenu.id}`}
          className={`flex items-center justify-between p-4 rounded-2xl mb-6 transition-colors ${
            currentWeekMenu.status === "PUBLISHED"
              ? "bg-emerald-50 border border-emerald-200 hover:bg-emerald-100"
              : currentWeekMenu.status === "DRAFT"
                ? "bg-yellow-50 border border-yellow-200 hover:bg-yellow-100"
                : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <CalendarDays
              className={`w-5 h-5 ${
                currentWeekMenu.status === "PUBLISHED"
                  ? "text-emerald-600"
                  : currentWeekMenu.status === "DRAFT"
                    ? "text-yellow-600"
                    : "text-gray-500"
              }`}
            />
            <span className="font-semibold">
              Uke {week}, {year}
            </span>
            <StatusBadge status={currentWeekMenu.status} />
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </Link>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-2xl mb-6 bg-gray-50 border border-gray-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-gray-400" />
            <span className="font-semibold text-gray-600">
              Uke {week}, {year} — Ikke opprettet ennå
            </span>
          </div>
          <Link
            href="/admin/weeks"
            className="text-sm font-semibold text-emerald-600 hover:underline"
          >
            Opprett →
          </Link>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/admin/weeks"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Opprett ukemeny
        </Link>
        <Link
          href="/admin/dishes"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <UtensilsCrossed className="w-4 h-4" />
          Legg til rett
        </Link>
        <Link
          href="/admin/analytics"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          Se analyse
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard title="Retter" value={dishCount} icon={UtensilsCrossed} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard title="Totale stemmer" value={voteCount} icon={Vote} color="text-blue-600" bg="bg-blue-50" delta={votesThisWeek > 0 ? `+${votesThisWeek} denne uken` : undefined} />
        <StatCard title="Ukemenyer" value={weekMenus.length} icon={CalendarDays} color="text-purple-600" bg="bg-purple-50" />
        <StatCard title="Elever" value={userCount} icon={Users} color="text-orange-600" bg="bg-orange-50" delta={usersThisWeek > 0 ? `+${usersThisWeek} denne uken` : undefined} />
        <StatCard title="Stemmer i uka" value={votesThisWeek} icon={TrendingUp} color="text-cyan-600" bg="bg-cyan-50" />
        <StatCard title="Publiserte" value={publishedMenuCount} icon={CheckCircle2} color="text-green-600" bg="bg-green-50" />
      </div>

      {voteTotal > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Stemmefordeling</h2>
          <div className="flex rounded-full overflow-hidden h-4 bg-gray-100">
            {voteDist.good > 0 && <div className="bg-emerald-400 transition-all" style={{ width: `${(voteDist.good / voteTotal) * 100}%` }} />}
            {voteDist.ok > 0 && <div className="bg-amber-400 transition-all" style={{ width: `${(voteDist.ok / voteTotal) * 100}%` }} />}
            {voteDist.bad > 0 && <div className="bg-red-400 transition-all" style={{ width: `${(voteDist.bad / voteTotal) * 100}%` }} />}
          </div>
          <div className="flex items-center gap-6 mt-3 text-sm">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-400" /> 😀 {Math.round((voteDist.good / voteTotal) * 100)}%</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400" /> 😐 {Math.round((voteDist.ok / voteTotal) * 100)}%</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400" /> 😞 {Math.round((voteDist.bad / voteTotal) * 100)}%</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">
          Dagens meny —{" "}
          <span className="text-gray-500 font-normal text-base">
            {formatInTimeZone(now, "Europe/Oslo", "EEEE d. MMMM", { locale: nb })}
          </span>
        </h2>
        {!todayMenu ? (
          <p className="text-gray-400 text-center py-6">Ingen meny for i dag</p>
        ) : !todayMenu.isOpen ? (
          <p className="text-gray-400 text-center py-6">Kantinen er stengt i dag</p>
        ) : todayMenu.items.length === 0 ? (
          <p className="text-gray-400 text-center py-6">Ingen retter lagt til ennå</p>
        ) : (
          <div className="space-y-3">
            {todayMenu.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50">
                {item.dish.imageUrl ? (
                  <Image src={item.dish.imageUrl} alt={item.dish.title} width={48} height={48} className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-lg font-bold">
                    {item.dish.title.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm truncate block">{item.dish.title}</span>
                  <span className="text-xs text-gray-400">{item.price} kr · {categoryLabels[item.category] ?? item.category}</span>
                </div>
                <span className="text-xs text-gray-400">{item._count.votes} stemmer</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {topDishes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ThumbsUp className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold">Topp retter denne uken</h2>
            </div>
            <div className="space-y-3">
              {top3.map((dish, i) => (
                <div key={dish.dishTitle} className="flex items-center gap-3 p-2 rounded-lg">
                  <span className="text-sm font-bold text-emerald-600 w-6">#{i + 1}</span>
                  <span className="flex-1 font-medium text-sm truncate">{dish.dishTitle}</span>
                  <span className="text-xs text-gray-400">{dish.total > 0 ? Math.round(((dish.score + dish.total) / (2 * dish.total)) * 100) : 0}% positiv</span>
                </div>
              ))}
              {top3.length === 0 && <p className="text-gray-400 text-sm text-center py-2">Ingen stemmer denne uken</p>}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ThumbsDown className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-bold">Minst populære denne uken</h2>
            </div>
            <div className="space-y-3">
              {bottom3.map((dish, i) => (
                <div key={dish.dishTitle} className="flex items-center gap-3 p-2 rounded-lg">
                  <span className="text-sm font-bold text-red-400 w-6">#{i + 1}</span>
                  <span className="flex-1 font-medium text-sm truncate">{dish.dishTitle}</span>
                  <span className="text-xs text-gray-400">{dish.total > 0 ? Math.round(((dish.score + dish.total) / (2 * dish.total)) * 100) : 0}% positiv</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Siste ukemenyer</h2>
          <Link href="/admin/weeks" className="text-emerald-600 text-sm font-medium hover:underline">Se alle →</Link>
        </div>
        <div className="space-y-3">
          {weekMenus.map((wm) => (
            <Link key={wm.id} href={`/admin/weeks/${wm.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div>
                <span className="font-semibold">Uke {wm.weekNumber}, {wm.year}</span>
                <span className="text-gray-500 text-sm ml-2">{wm.days.reduce((sum, d) => sum + d._count.items, 0)} retter</span>
              </div>
              <StatusBadge status={wm.status} />
            </Link>
          ))}
          {weekMenus.length === 0 && <p className="text-gray-400 text-center py-4">Ingen ukemenyer opprettet ennå</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-4">Siste stemmer</h2>
        <div className="space-y-2">
          {recentVotes.map((vote) => (
            <div key={vote.id} className="flex items-center gap-3 text-sm p-2 rounded-lg">
              <span className="text-lg">{vote.value === 1 ? "😀" : vote.value === 0 ? "😐" : "😞"}</span>
              <span className="font-medium">{vote.user.name}</span>
              <span className="text-gray-400">stemte på</span>
              <span className="text-gray-700 flex-1 truncate">{vote.menuItem.dish.title}</span>
              <RelativeTime date={vote.createdAt.toISOString()} />
            </div>
          ))}
          {recentVotes.length === 0 && <p className="text-gray-400 text-center py-4">Ingen stemmer ennå</p>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg, delta }: { title: string; value: number; icon: LucideIcon; color: string; bg: string; delta?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <span className="text-2xl font-bold block">{value}</span>
      <span className="text-xs text-gray-500">{title}</span>
      {delta && <span className="block text-xs text-emerald-600 font-medium mt-1">{delta}</span>}
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
    <span className={`text-xs font-bold px-2 py-1 rounded-full ${styles[status] ?? "bg-gray-100"}`}>
      {labels[status] ?? status}
    </span>
  );
}
