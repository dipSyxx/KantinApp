import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { validateQuery } from "@/lib/validate";
import { notFound } from "@/lib/errors";
import { requireUser } from "@/lib/auth";
import { getSchoolScope } from "@/lib/school";

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
});

export async function GET(request: NextRequest) {
  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const { schoolId, error: schoolError } = getSchoolScope(user, request);
  if (schoolError) return schoolError;

  const result = validateQuery(request, querySchema);
  if (result.error) return result.error;

  const { date } = result.data;

  const menuDay = await prisma.menuDay.findFirst({
    where: {
      date: new Date(date),
      weekMenu: { schoolId, status: "PUBLISHED" },
    },
    include: {
      weekMenu: {
        select: { status: true, year: true, weekNumber: true },
      },
      items: {
        where: { status: { not: "CHANGED" } },
        orderBy: { sortOrder: "asc" },
        include: {
          dish: {
            select: {
              id: true,
              title: true,
              description: true,
              imageUrl: true,
              allergens: true,
              tags: true,
            },
          },
          _count: { select: { votes: true } },
        },
      },
    },
  });

  if (!menuDay) {
    return notFound("No published menu for this date");
  }

  const response = {
    id: menuDay.id,
    date: menuDay.date.toISOString().split("T")[0],
    isOpen: menuDay.isOpen,
    notes: menuDay.notes,
    week: {
      year: menuDay.weekMenu.year,
      weekNumber: menuDay.weekMenu.weekNumber,
    },
    items: menuDay.items.map((item) => ({
      id: item.id,
      price: item.price,
      category: item.category,
      status: item.status,
      dish: item.dish,
      voteCount: item._count.votes,
    })),
  };

  return NextResponse.json(response);
}
