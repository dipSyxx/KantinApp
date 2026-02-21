import { prisma } from "@/lib/db";
import { currentISOWeek, weekDates } from "@/lib/week";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { CreateWeekForm } from "./CreateWeekForm";
import { WeekFilter } from "./WeekFilter";

export const dynamic = "force-dynamic";

export default async function WeeksPage() {
  const weekMenus = await prisma.weekMenu.findMany({
    orderBy: [{ year: "desc" }, { weekNumber: "desc" }],
    include: {
      days: {
        orderBy: { date: "asc" },
        include: {
          _count: { select: { items: true } },
        },
      },
    },
  });

  const { year: curYear, week: curWeek } = currentISOWeek();

  const serialized = weekMenus.map((wm) => {
    const totalItems = wm.days.reduce((sum, d) => sum + d._count.items, 0);
    const filledDays = wm.days.filter((d) => d._count.items > 0).length;
    const dates = weekDates(wm.year, wm.weekNumber);
    const monDate = dates[0];
    const friDate = dates[4];
    const fmt = (d: Date) =>
      `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const dateRange = `${fmt(monDate)} – ${fmt(friDate)}`;
    const isCurrent = wm.year === curYear && wm.weekNumber === curWeek;

    return {
      id: wm.id,
      year: wm.year,
      weekNumber: wm.weekNumber,
      status: wm.status,
      publishedAt: wm.publishedAt?.toISOString() ?? null,
      totalItems,
      filledDays,
      totalDays: wm.days.length,
      dateRange,
      isCurrent,
      days: wm.days.map((d) => ({
        id: d.id,
        dayOfWeek: new Date(d.date).getUTCDay(),
        itemCount: d._count.items,
      })),
    };
  });

  const years = [...new Set(serialized.map((w) => w.year))].sort(
    (a, b) => b - a
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Ukemenyer</h1>
      </div>

      <CreateWeekForm
        existingWeeks={serialized.map((w) => ({
          id: w.id,
          year: w.year,
          weekNumber: w.weekNumber,
        }))}
      />

      <WeekFilter years={years} weeks={serialized} />
    </div>
  );
}
