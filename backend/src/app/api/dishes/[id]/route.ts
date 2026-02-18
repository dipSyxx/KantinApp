import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notFound } from "@/lib/errors";

type RouteParams = { params: Promise<{ id: string }> };

const PUBLISHED_ITEM_FILTER = {
  menuDay: {
    weekMenu: {
      status: "PUBLISHED" as const,
    },
  },
};

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const dish = await prisma.dish.findUnique({
    where: { id },
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
