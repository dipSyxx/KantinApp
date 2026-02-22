import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentISOWeek } from "@/lib/week";
import { validateQuery } from "@/lib/validate";
import { notFound } from "@/lib/errors";
import { requireUser } from "@/lib/auth";
import { getSchoolScope } from "@/lib/school";

const querySchema = z.object({
  year: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
  week: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
});

export async function GET(request: NextRequest) {
  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const { schoolId, error: schoolError } = getSchoolScope(user, request);
  if (schoolError) return schoolError;

  const result = validateQuery(request, querySchema);
  if (result.error) return result.error;

  const { year, week } = result.data;
  const current = currentISOWeek();
  const targetYear = year ?? current.year;
  const targetWeek = week ?? current.week;

  const weekMenu = await prisma.weekMenu.findUnique({
    where: {
      year_weekNumber_schoolId: {
        year: targetYear,
        weekNumber: targetWeek,
        schoolId,
      },
      status: "PUBLISHED",
    },
    include: {
      days: {
        orderBy: { date: "asc" },
        include: {
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
              _count: {
                select: { votes: true },
              },
            },
          },
        },
      },
    },
  });

  if (!weekMenu) {
    return notFound("Menu for this week is not published yet");
  }

  const response = {
    id: weekMenu.id,
    year: weekMenu.year,
    weekNumber: weekMenu.weekNumber,
    status: weekMenu.status,
    publishedAt: weekMenu.publishedAt,
    days: weekMenu.days.map((day) => ({
      id: day.id,
      date: day.date.toISOString().split("T")[0],
      isOpen: day.isOpen,
      notes: day.notes,
      items: day.items.map((item) => ({
        id: item.id,
        price: item.price,
        category: item.category,
        status: item.status,
        dish: item.dish,
        voteCount: item._count.votes,
      })),
    })),
  };

  return NextResponse.json(response);
}
