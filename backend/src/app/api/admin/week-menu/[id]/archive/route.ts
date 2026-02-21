import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth";
import { notFound, conflict } from "@/lib/errors";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, ["CANTEEN_ADMIN", "SCHOOL_ADMIN"]);
  if (roleError) return roleError;

  const weekMenu = await prisma.weekMenu.findUnique({ where: { id } });
  if (!weekMenu) return notFound("Week menu not found");

  if (weekMenu.status !== "PUBLISHED") {
    return conflict("Only published week menus can be archived");
  }

  const updated = await prisma.weekMenu.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, ["CANTEEN_ADMIN", "SCHOOL_ADMIN"]);
  if (roleError) return roleError;

  const weekMenu = await prisma.weekMenu.findUnique({ where: { id } });
  if (!weekMenu) return notFound("Week menu not found");

  if (weekMenu.status !== "ARCHIVED") {
    return conflict("Only archived week menus can be restored");
  }

  const updated = await prisma.weekMenu.update({
    where: { id },
    data: { status: "PUBLISHED" },
  });

  return NextResponse.json(updated);
}
