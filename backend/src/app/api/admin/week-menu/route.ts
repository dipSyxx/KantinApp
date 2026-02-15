import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { conflict } from "@/lib/errors";

const createWeekMenuSchema = z.object({
  year: z.number().int().min(2024).max(2100),
  weekNumber: z.number().int().min(1).max(53),
});

export async function GET(request: NextRequest) {
  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, ["CANTEEN_ADMIN", "SCHOOL_ADMIN"]);
  if (roleError) return roleError;

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
    take: 20,
  });

  return NextResponse.json(weekMenus);
}

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, ["CANTEEN_ADMIN", "SCHOOL_ADMIN"]);
  if (roleError) return roleError;

  const result = await validateBody(request, createWeekMenuSchema);
  if (result.error) return result.error;

  const { year, weekNumber } = result.data;

  // Check if already exists
  const existing = await prisma.weekMenu.findUnique({
    where: { year_weekNumber: { year, weekNumber } },
  });

  if (existing) {
    return conflict(`Week menu for ${year} W${weekNumber} already exists`);
  }

  // Create week menu with 5 days (Mon-Fri)
  // Calculate Monday of that ISO week
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7; // 1=Mon, 7=Sun
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (weekNumber - 1) * 7);

  const weekMenu = await prisma.weekMenu.create({
    data: {
      year,
      weekNumber,
      status: "DRAFT",
      days: {
        create: Array.from({ length: 5 }, (_, i) => {
          const date = new Date(monday);
          date.setDate(monday.getDate() + i);
          return {
            date,
            isOpen: true,
          };
        }),
      },
    },
    include: {
      days: { orderBy: { date: "asc" } },
    },
  });

  return NextResponse.json(weekMenu, { status: 201 });
}
