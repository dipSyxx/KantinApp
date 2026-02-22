import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { notFound } from "@/lib/errors";

const updateMenuItemSchema = z.object({
  dishId: z.string().min(1).optional(),
  price: z.number().int().min(0).optional(),
  category: z.enum(["MAIN", "VEG", "SOUP", "DESSERT", "OTHER"]).optional(),
  sortOrder: z.number().int().optional(),
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

  const result = await validateBody(request, updateMenuItemSchema);
  if (result.error) return result.error;

  const menuItem = await prisma.menuItem.update({
    where: { id },
    data: result.data,
    include: { dish: true },
  });

  return NextResponse.json(menuItem);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, ["CANTEEN_ADMIN", "SCHOOL_ADMIN", "SUPER_ADMIN"]);
  if (roleError) return roleError;

  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) return notFound("Menu item not found");

  await prisma.menuItem.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
