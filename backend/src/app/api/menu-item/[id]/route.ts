import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notFound } from "@/lib/errors";
import { getOptionalUser } from "@/lib/auth";
import { isToday } from "@/lib/week";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const menuItem = await prisma.menuItem.findUnique({
    where: { id },
    include: {
      dish: true,
      menuDay: {
        select: {
          date: true,
          isOpen: true,
          notes: true,
          weekMenu: {
            select: {
              status: true,
            },
          },
        },
      },
      votes: {
        select: {
          value: true,
        },
      },
    },
  });

  if (!menuItem || menuItem.menuDay.weekMenu.status !== "PUBLISHED") {
    return notFound("Menypunkt ikke funnet");
  }

  const isTodayMenuDay = isToday(menuItem.menuDay.date);
  const canVote = menuItem.menuDay.isOpen && isTodayMenuDay;

  let voteLockedReason: string | null = null;
  if (!menuItem.menuDay.isOpen) {
    voteLockedReason = "Denne dagen er stengt";
  } else if (!isTodayMenuDay) {
    voteLockedReason = "Du kan bare stemme på dagens retter";
  }

  // Compute vote stats
  const stats = { up: 0, mid: 0, down: 0, total: 0 };
  for (const vote of menuItem.votes) {
    stats.total++;
    if (vote.value === 1) stats.up++;
    else if (vote.value === 0) stats.mid++;
    else if (vote.value === -1) stats.down++;
  }

  // Check if requesting user has voted (from auth header)
  let myVote: number | null = null;
  const { user } = await getOptionalUser();
  if (user) {
    const userVote = await prisma.vote.findUnique({
      where: {
        menuItemId_userId: {
          menuItemId: id,
          userId: user.id,
        },
      },
    });
    myVote = userVote?.value ?? null;
  }

  const response = {
    id: menuItem.id,
    price: menuItem.price,
    category: menuItem.category,
    status: menuItem.status,
    dish: {
      id: menuItem.dish.id,
      title: menuItem.dish.title,
      description: menuItem.dish.description,
      imageUrl: menuItem.dish.imageUrl,
      allergens: menuItem.dish.allergens,
      tags: menuItem.dish.tags,
    },
    day: {
      date: menuItem.menuDay.date.toISOString().split("T")[0],
      isOpen: menuItem.menuDay.isOpen,
      notes: menuItem.menuDay.notes,
    },
    canVote,
    voteLockedReason,
    stats,
    myVote,
  };

  return NextResponse.json(response);
}
