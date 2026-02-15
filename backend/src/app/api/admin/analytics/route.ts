import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth";
import { validateQuery } from "@/lib/validate";

const querySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
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

  // Build date filter
  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) dateFilter.lte = new Date(to);

  // Get menu items with votes grouped by day
  const menuItems = await prisma.menuItem.findMany({
    where: {
      menuDay: dateFilter.gte || dateFilter.lte
        ? { date: dateFilter }
        : undefined,
    },
    include: {
      dish: { select: { title: true } },
      menuDay: { select: { date: true } },
      votes: { select: { value: true } },
    },
    orderBy: { menuDay: { date: "desc" } },
  });

  // Compute stats per item
  const analytics = menuItems.map((item) => {
    const votes = item.votes;
    const up = votes.filter((v) => v.value === 1).length;
    const mid = votes.filter((v) => v.value === 0).length;
    const down = votes.filter((v) => v.value === -1).length;
    const total = votes.length;
    const avgScore = total > 0
      ? ((up * 1 + mid * 0 + down * -1) / total).toFixed(2)
      : "0.00";

    return {
      date: item.menuDay.date.toISOString().split("T")[0],
      dish: item.dish.title,
      category: item.category,
      status: item.status,
      votes: { up, mid, down, total },
      avgScore: parseFloat(avgScore),
    };
  });

  // CSV export
  if (format === "csv") {
    const headers = "Date,Dish,Category,Status,Votes Up,Votes Mid,Votes Down,Total,Avg Score";
    const rows = analytics.map((a) =>
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

  // Summary stats
  const totalVotes = analytics.reduce((sum, a) => sum + a.votes.total, 0);
  const topDishes = [...analytics]
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5);

  return NextResponse.json({
    summary: {
      totalItems: analytics.length,
      totalVotes,
      averageVotesPerItem: analytics.length > 0
        ? (totalVotes / analytics.length).toFixed(1)
        : "0",
    },
    topDishes,
    items: analytics,
  });
}
