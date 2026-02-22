import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notFound } from "@/lib/errors";
import { requireUser } from "@/lib/auth";
import { getSchoolScope } from "@/lib/school";

type RouteParams = { params: Promise<{ id: string }> };

const PUBLISHED_ITEM_FILTER = {
  menuDay: {
    weekMenu: {
      status: "PUBLISHED" as const,
    },
  },
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const { schoolId, error: schoolError } = getSchoolScope(user, request);
  if (schoolError) return schoolError;

  const { id } = await params;

  const dish = await prisma.dish.findUnique({
    where: { id, schoolId },
    include: {
      menuItems: {
        where: PUBLISHED_ITEM_FILTER,
        orderBy: [{ menuDay: { date: "desc" } }, { createdAt: "desc" }],
        take: 1,
        select: { price: true },
      },
    },
  });

  if (!dish || dish.menuItems.length === 0) {
    return notFound("Rett ikke funnet");
  }

  const response = {
    id: dish.id,
    title: dish.title,
    description: dish.description,
    imageUrl: dish.imageUrl,
    allergens: dish.allergens,
    tags: dish.tags,
    latestPrice: dish.menuItems[0]?.price ?? null,
  };

  return NextResponse.json(response);
}
