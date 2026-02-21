import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth";
import { validateQuery } from "@/lib/validate";

const querySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  format: z.enum(["json", "csv"]).default("json"),
});

export async function GET(request: NextRequest) {
  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, ["CANTEEN_ADMIN", "SCHOOL_ADMIN"]);
  if (roleError) return roleError;

  const result = validateQuery(request, querySchema);
  if (result.error) return result.error;

  const { from, to, format } = result.data;

  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) dateFilter.lte = new Date(to);

  const dayFilter =
    dateFilter.gte || dateFilter.lte ? { date: dateFilter } : undefined;

  const menuItems = await prisma.menuItem.findMany({
    where: { menuDay: dayFilter },
    include: {
      dish: { select: { title: true, imageUrl: true } },
      menuDay: { select: { date: true } },
      votes: { select: { value: true, createdAt: true } },
    },
    orderBy: { menuDay: { date: "desc" } },
  });

  const analytics = menuItems.map((item) => {
    const votes = item.votes;
    const up = votes.filter((v) => v.value === 1).length;
    const mid = votes.filter((v) => v.value === 0).length;
    const down = votes.filter((v) => v.value === -1).length;
    const total = votes.length;
    const avgScore =
      total > 0
        ? parseFloat(((up * 1 + mid * 0 + down * -1) / total).toFixed(2))
        : 0;

    return {
      date: item.menuDay.date.toISOString().split("T")[0],
      dish: item.dish.title,
      imageUrl: item.dish.imageUrl,
      category: item.category,
      status: item.status,
      votes: { up, mid, down, total },
      avgScore,
    };
  });

  // CSV export
  if (format === "csv") {
    const headers =
      "Date,Dish,Category,Status,Votes Up,Votes Mid,Votes Down,Total,Avg Score";
    const rows = analytics.map(
      (a) =>
        `${a.date},"${a.dish}",${a.category},${a.status},${a.votes.up},${a.votes.mid},${a.votes.down},${a.votes.total},${a.avgScore}`
    );
    const csv = [headers, ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="analytics-${from ?? "all"}-${to ?? "all"}.csv"`,
      },
    });
  }

  // Aggregations
  const totalVotes = analytics.reduce((sum, a) => sum + a.votes.total, 0);
  const itemsWithVotes = analytics.filter((a) => a.votes.total > 0).length;

  // Vote distribution
  const voteDistribution = { up: 0, mid: 0, down: 0 };
  for (const a of analytics) {
    voteDistribution.up += a.votes.up;
    voteDistribution.mid += a.votes.mid;
    voteDistribution.down += a.votes.down;
  }

  // Category breakdown
  const catMap = new Map<
    string,
    { category: string; up: number; mid: number; down: number; total: number }
  >();
  for (const a of analytics) {
    const c = catMap.get(a.category) ?? {
      category: a.category,
      up: 0,
      mid: 0,
      down: 0,
      total: 0,
    };
    c.up += a.votes.up;
    c.mid += a.votes.mid;
    c.down += a.votes.down;
    c.total += a.votes.total;
    catMap.set(a.category, c);
  }
  const categoryBreakdown = [...catMap.values()].sort(
    (a, b) => b.total - a.total
  );

  // Daily trend
  const dayMap = new Map<
    string,
    { date: string; up: number; mid: number; down: number; total: number }
  >();
  for (const a of analytics) {
    const d = dayMap.get(a.date) ?? {
      date: a.date,
      up: 0,
      mid: 0,
      down: 0,
      total: 0,
    };
    d.up += a.votes.up;
    d.mid += a.votes.mid;
    d.down += a.votes.down;
    d.total += a.votes.total;
    dayMap.set(a.date, d);
  }
  const dailyTrend = [...dayMap.values()].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Dish aggregation (group by dish name)
  const dishMap = new Map<
    string,
    {
      dish: string;
      imageUrl: string | null;
      up: number;
      mid: number;
      down: number;
      total: number;
      history: { date: string; up: number; mid: number; down: number; total: number }[];
    }
  >();
  for (const a of analytics) {
    const d = dishMap.get(a.dish) ?? {
      dish: a.dish,
      imageUrl: a.imageUrl,
      up: 0,
      mid: 0,
      down: 0,
      total: 0,
      history: [],
    };
    d.up += a.votes.up;
    d.mid += a.votes.mid;
    d.down += a.votes.down;
    d.total += a.votes.total;
    if (a.votes.total > 0) {
      d.history.push({
        date: a.date,
        up: a.votes.up,
        mid: a.votes.mid,
        down: a.votes.down,
        total: a.votes.total,
      });
    }
    dishMap.set(a.dish, d);
  }

  const dishes = [...dishMap.values()].map((d) => ({
    ...d,
    score: d.total > 0 ? parseFloat(((d.up - d.down) / d.total).toFixed(2)) : 0,
    positivePct: d.total > 0 ? Math.round((d.up / d.total) * 100) : 0,
    history: d.history.sort((a, b) => a.date.localeCompare(b.date)),
  }));

  // Day-of-week engagement
  const dowCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const a of analytics) {
    const dow = new Date(a.date).getDay();
    dowCounts[dow] += a.votes.total;
  }
  const dowNames = [
    "Sondag",
    "Mandag",
    "Tirsdag",
    "Onsdag",
    "Torsdag",
    "Fredag",
    "Lordag",
  ];
  const mostActiveDay =
    dowCounts.reduce(
      (best, count, i) => (count > best.count ? { day: dowNames[i], count } : best),
      { day: "-", count: 0 }
    );

  const avgScoreAll =
    totalVotes > 0
      ? parseFloat(
          (
            (voteDistribution.up - voteDistribution.down) /
            totalVotes
          ).toFixed(2)
        )
      : 0;

  return NextResponse.json({
    summary: {
      totalItems: analytics.length,
      totalVotes,
      totalDishes: dishMap.size,
      averageVotesPerItem:
        analytics.length > 0
          ? parseFloat((totalVotes / analytics.length).toFixed(1))
          : 0,
      avgScore: avgScoreAll,
    },
    voteDistribution,
    categoryBreakdown,
    dailyTrend,
    dishes,
    engagement: {
      itemsWithVotes,
      itemsTotal: analytics.length,
      pctWithVotes:
        analytics.length > 0
          ? Math.round((itemsWithVotes / analytics.length) * 100)
          : 0,
      avgVotesPerItem:
        itemsWithVotes > 0
          ? parseFloat((totalVotes / itemsWithVotes).toFixed(1))
          : 0,
      mostActiveDay: mostActiveDay.day,
      mostActiveDayCount: mostActiveDay.count,
    },
    items: analytics,
  });
}
