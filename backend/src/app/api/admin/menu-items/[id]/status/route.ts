import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { notFound } from "@/lib/errors";

const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "CHANGED", "SOLD_OUT"]),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, ["CANTEEN_ADMIN", "SCHOOL_ADMIN", "SUPER_ADMIN"]);
  if (roleError) return roleError;

  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) return notFound("Menu item not found");

  const result = await validateBody(request, updateStatusSchema);
  if (result.error) return result.error;

  const menuItem = await prisma.menuItem.update({
    where: { id },
    data: { status: result.data.status },
    include: { dish: true },
  });

  return NextResponse.json(menuItem);
}
