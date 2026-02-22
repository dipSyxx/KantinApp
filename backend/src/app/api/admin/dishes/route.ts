import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { getSchoolScope } from "@/lib/school";

const ADMIN_ROLES = ["CANTEEN_ADMIN", "SCHOOL_ADMIN", "SUPER_ADMIN"] as const;

const createDishSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  allergens: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

export async function GET(request: NextRequest) {
  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, [...ADMIN_ROLES]);
  if (roleError) return roleError;

  const { schoolId, error: schoolError } = getSchoolScope(user!, request);
  if (schoolError) return schoolError;

  const dishes = await prisma.dish.findMany({
    where: { schoolId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { menuItems: true } },
    },
  });

  return NextResponse.json(dishes);
}

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, [...ADMIN_ROLES]);
  if (roleError) return roleError;

  const { schoolId, error: schoolError } = getSchoolScope(user!, request);
  if (schoolError) return schoolError;

  const result = await validateBody(request, createDishSchema);
  if (result.error) return result.error;

  const dish = await prisma.dish.create({
    data: { ...result.data, schoolId },
  });

  return NextResponse.json(dish, { status: 201 });
}
