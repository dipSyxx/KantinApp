import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { notFound, conflict } from "@/lib/errors";
import { weekDates } from "@/lib/week";

const copySchema = z.object({
  year: z.number().int().min(2024).max(2100),
  weekNumber: z.number().int().min(1).max(53),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, ["CANTEEN_ADMIN", "SCHOOL_ADMIN"]);
  if (roleError) return roleError;

  const result = await validateBody(request, copySchema);
  if (result.error) return result.error;

  const { year, weekNumber } = result.data;

  const source = await prisma.weekMenu.findUnique({
    where: { id },
    include: {
      days: {
        orderBy: { date: "asc" },
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
            select: { dishId: true, price: true, category: true, sortOrder: true },
          },
        },
      },
    },
  });

  if (!source) return notFound("Source week menu not found");

  const existing = await prisma.weekMenu.findUnique({
    where: { year_weekNumber: { year, weekNumber } },
  });
  if (existing) return conflict(`Week menu for ${year} W${weekNumber} already exists`);

  const dates = weekDates(year, weekNumber);

  const newMenu = await prisma.weekMenu.create({
    data: {
      year,
      weekNumber,
      status: "DRAFT",
      days: {
        create: dates.map((date, i) => {
          const sourceDay = source.days[i];
          return {
            date,
            isOpen: sourceDay?.isOpen ?? true,
            items: sourceDay
              ? {
                  create: sourceDay.items.map((item) => ({
                    dishId: item.dishId,
                    price: item.price,
                    category: item.category,
                    sortOrder: item.sortOrder,
                  })),
                }
              : undefined,
          };
        }),
      },
    },
    include: {
      days: {
        orderBy: { date: "asc" },
        include: { items: { include: { dish: true } } },
      },
    },
  });

  return NextResponse.json(newMenu, { status: 201 });
}
