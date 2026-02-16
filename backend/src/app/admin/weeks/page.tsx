import { prisma } from "@/lib/db";
import Link from "next/link";
import { CreateWeekForm } from "./CreateWeekForm";

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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Ukemenyer</h1>
      </div>

      {/* Create new week form */}
      <CreateWeekForm />

      {/* List */}
      <div className="space-y-4">
        {weekMenus.map((wm) => {
          const totalItems = wm.days.reduce(
            (sum, d) => sum + d._count.items,
            0
          );

          return (
            <Link
              key={wm.id}
              href={`/admin/weeks/${wm.id}`}
              className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-emerald-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    Uke {wm.weekNumber}, {wm.year}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {wm.days.length} dager · {totalItems} retter
                    {wm.publishedAt &&
                      ` · Publisert ${new Date(wm.publishedAt).toLocaleDateString("no-NO")}`}
                  </p>
                </div>
                <StatusBadge status={wm.status} />
              </div>

              {/* Day summary */}
              <div className="flex gap-2 mt-3">
                {wm.days.map((day) => {
                  // day.date is a Date object from Prisma @db.Date — use UTC methods to avoid timezone shift
                  const d = new Date(day.date);
                  const dayName = ["søn.", "man.", "tir.", "ons.", "tor.", "fre.", "lør."][d.getUTCDay()];
                  return (
                    <div
                      key={day.id}
                      className="flex-1 bg-gray-50 rounded-lg p-2 text-center"
                    >
                      <div className="text-xs text-gray-500">
                        {dayName}
                      </div>
                      <div className="text-sm font-bold">
                        {day._count.items}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Link>
          );
        })}

        {weekMenus.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            Ingen ukemenyer opprettet. Opprett den første ovenfor.
          </div>
        )}
      </div>
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
      className={`text-xs font-bold px-3 py-1 rounded-full ${styles[status] ?? "bg-gray-100"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
