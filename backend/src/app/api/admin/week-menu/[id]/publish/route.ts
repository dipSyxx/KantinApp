import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth";
import { notFound, conflict } from "@/lib/errors";
import { getSchoolScope } from "@/lib/school";

const ADMIN_ROLES = ["CANTEEN_ADMIN", "SCHOOL_ADMIN", "SUPER_ADMIN"] as const;

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, [...ADMIN_ROLES]);
  if (roleError) return roleError;

  const { schoolId, error: schoolError } = getSchoolScope(user!, request);
  if (schoolError) return schoolError;

  const weekMenu = await prisma.weekMenu.findUnique({
    where: { id, schoolId },
  });

  if (!weekMenu) return notFound("Week menu not found");

  if (weekMenu.status === "PUBLISHED") {
    return conflict("Week menu is already published");
  }

  if (weekMenu.status === "ARCHIVED") {
    return conflict("Cannot publish an archived week menu");
  }

  const updated = await prisma.weekMenu.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
    include: {
      days: {
        orderBy: { date: "asc" },
        include: {
          items: {
            include: { dish: true },
          },
        },
      },
    },
  });

  return NextResponse.json(updated);
}
