import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { notFound } from "@/lib/errors";
import { getSchoolScope } from "@/lib/school";

const ADMIN_ROLES = ["CANTEEN_ADMIN", "SCHOOL_ADMIN", "SUPER_ADMIN"] as const;

const updateDishSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  allergens: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, [...ADMIN_ROLES]);
  if (roleError) return roleError;

  const { schoolId, error: schoolError } = getSchoolScope(user!, request);
  if (schoolError) return schoolError;

  const dish = await prisma.dish.findUnique({
    where: { id, schoolId },
    include: {
      menuItems: {
        include: {
          menuDay: { select: { date: true } },
          _count: { select: { votes: true } },
        },
      },
    },
  });

  if (!dish) return notFound("Dish not found");

  return NextResponse.json(dish);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, [...ADMIN_ROLES]);
  if (roleError) return roleError;

  const { schoolId, error: schoolError } = getSchoolScope(user!, request);
  if (schoolError) return schoolError;

  const result = await validateBody(request, updateDishSchema);
  if (result.error) return result.error;

  const existing = await prisma.dish.findUnique({ where: { id, schoolId } });
  if (!existing) return notFound("Dish not found");

  if (
    result.data.imageUrl !== undefined &&
    existing.imageUrl &&
    existing.imageUrl !== result.data.imageUrl &&
    existing.imageUrl.includes(".vercel-storage.com")
  ) {
    const othersUsingSameImage = await prisma.dish.count({
      where: { imageUrl: existing.imageUrl, id: { not: id } },
    });
    if (othersUsingSameImage === 0) {
      try {
        await del(existing.imageUrl);
      } catch {
        // Old blob may not exist
      }
    }
  }

  const dish = await prisma.dish.update({
    where: { id },
    data: result.data,
  });

  return NextResponse.json(dish);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, [...ADMIN_ROLES]);
  if (roleError) return roleError;

  const { schoolId, error: schoolError } = getSchoolScope(user!, request);
  if (schoolError) return schoolError;

  const existing = await prisma.dish.findUnique({ where: { id, schoolId } });
  if (!existing) return notFound("Dish not found");

  if (existing.imageUrl?.includes(".vercel-storage.com")) {
    const othersUsingSameImage = await prisma.dish.count({
      where: { imageUrl: existing.imageUrl, id: { not: id } },
    });
    if (othersUsingSameImage === 0) {
      try {
        await del(existing.imageUrl);
      } catch {
        // Blob may already be deleted
      }
    }
  }

  await prisma.dish.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
