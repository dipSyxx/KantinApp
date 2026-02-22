import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth";
import { notFound } from "@/lib/errors";
import { getSchoolScope } from "@/lib/school";

const ADMIN_ROLES = ["CANTEEN_ADMIN", "SCHOOL_ADMIN", "SUPER_ADMIN"] as const;

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, [...ADMIN_ROLES]);
  if (roleError) return roleError;

  const { schoolId, error: schoolError } = getSchoolScope(user!, request);
  if (schoolError) return schoolError;

  const weekMenu = await prisma.weekMenu.findUnique({
    where: { id, schoolId },
    include: {
      days: {
        orderBy: { date: "asc" },
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
            include: {
              dish: true,
              _count: { select: { votes: true } },
            },
          },
        },
      },
    },
  });

  if (!weekMenu) return notFound("Week menu not found");

  return NextResponse.json(weekMenu);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, [...ADMIN_ROLES]);
  if (roleError) return roleError;

  const { schoolId, error: schoolError } = getSchoolScope(user!, request);
  if (schoolError) return schoolError;

  const existing = await prisma.weekMenu.findUnique({ where: { id, schoolId } });
  if (!existing) return notFound("Week menu not found");

  await prisma.weekMenu.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
