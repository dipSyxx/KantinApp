import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getSchoolScope } from "@/lib/school";

const PUBLISHED_ITEM_FILTER = {
  menuDay: {
    weekMenu: {
      status: "PUBLISHED" as const,
    },
  },
};

export async function GET(request: NextRequest) {
  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const { schoolId, error: schoolError } = getSchoolScope(user, request);
  if (schoolError) return schoolError;

  const dishes = await prisma.dish.findMany({
    where: {
      schoolId,
      menuItems: {
        some: PUBLISHED_ITEM_FILTER,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      menuItems: {
        where: PUBLISHED_ITEM_FILTER,
        orderBy: [{ menuDay: { date: "desc" } }, { createdAt: "desc" }],
        take: 1,
        select: {
          price: true,
        },
      },
    },
  });

  const response = dishes.map((dish) => ({
    id: dish.id,
    title: dish.title,
    description: dish.description,
    imageUrl: dish.imageUrl,
    allergens: dish.allergens,
    tags: dish.tags,
    latestPrice: dish.menuItems[0]?.price ?? null,
    createdAt: dish.createdAt.toISOString(),
  }));

  return NextResponse.json(response);
}
