import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { notFound } from "@/lib/errors";

const updateDaySchema = z.object({
  isOpen: z.boolean(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, ["CANTEEN_ADMIN", "SCHOOL_ADMIN", "SUPER_ADMIN"]);
  if (roleError) return roleError;

  const existing = await prisma.menuDay.findUnique({ where: { id } });
  if (!existing) return notFound("Menu day not found");

  const result = await validateBody(request, updateDaySchema);
  if (result.error) return result.error;

  const updated = await prisma.menuDay.update({
    where: { id },
    data: { isOpen: result.data.isOpen },
  });

  return NextResponse.json(updated);
}
