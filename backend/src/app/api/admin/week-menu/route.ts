import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { conflict } from "@/lib/errors";
import { weekDates } from "@/lib/week";
import { getSchoolScope } from "@/lib/school";

const ADMIN_ROLES = ["CANTEEN_ADMIN", "SCHOOL_ADMIN", "SUPER_ADMIN"] as const;

const createWeekMenuSchema = z.object({
  year: z.number().int().min(2024).max(2100),
  weekNumber: z.number().int().min(1).max(53),
});

export async function GET(request: NextRequest) {
  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, [...ADMIN_ROLES]);
  if (roleError) return roleError;

  const { schoolId, error: schoolError } = getSchoolScope(user!, request);
  if (schoolError) return schoolError;

  const weekMenus = await prisma.weekMenu.findMany({
    where: { schoolId },
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

  const roleError = requireRole(user!.role, [...ADMIN_ROLES]);
  if (roleError) return roleError;

  const { schoolId, error: schoolError } = getSchoolScope(user!, request);
  if (schoolError) return schoolError;

  const result = await validateBody(request, createWeekMenuSchema);
  if (result.error) return result.error;

  const { year, weekNumber } = result.data;

  const existing = await prisma.weekMenu.findUnique({
    where: { year_weekNumber_schoolId: { year, weekNumber, schoolId } },
  });

  if (existing) {
    return conflict(`Week menu for ${year} W${weekNumber} already exists`);
  }

  const dates = weekDates(year, weekNumber);

  const weekMenu = await prisma.weekMenu.create({
    data: {
      year,
      weekNumber,
      status: "DRAFT",
      schoolId,
      days: {
        create: dates.map((date) => ({
          date,
          isOpen: true,
        })),
      },
    },
    include: {
      days: { orderBy: { date: "asc" } },
    },
  });

  return NextResponse.json(weekMenu, { status: 201 });
}
