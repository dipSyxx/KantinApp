import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const PUBLISHED_ITEM_FILTER = {
  menuDay: {
    weekMenu: {
      status: "PUBLISHED" as const,
    },
  },
};

export async function GET() {
  const dishes = await prisma.dish.findMany({
    where: {
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
