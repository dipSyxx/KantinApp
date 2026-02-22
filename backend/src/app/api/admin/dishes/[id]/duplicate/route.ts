import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth";
import { notFound } from "@/lib/errors";
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

  const source = await prisma.dish.findUnique({ where: { id, schoolId } });
  if (!source) return notFound("Dish not found");

  const dish = await prisma.dish.create({
    data: {
      title: `${source.title} (kopi)`,
      description: source.description,
      imageUrl: source.imageUrl,
      allergens: source.allergens,
      tags: source.tags,
      schoolId,
    },
  });

  return NextResponse.json(dish, { status: 201 });
}
