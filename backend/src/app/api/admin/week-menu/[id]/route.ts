import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth";
import { notFound } from "@/lib/errors";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, ["CANTEEN_ADMIN", "SCHOOL_ADMIN"]);
  if (roleError) return roleError;

  const weekMenu = await prisma.weekMenu.findUnique({
    where: { id },
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

  const roleError = requireRole(user!.role, ["CANTEEN_ADMIN", "SCHOOL_ADMIN"]);
  if (roleError) return roleError;

  const existing = await prisma.weekMenu.findUnique({ where: { id } });
  if (!existing) return notFound("Week menu not found");

  await prisma.weekMenu.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
