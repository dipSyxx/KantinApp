import { prisma } from "@/lib/db";
import { isToday } from "@/lib/week";

export type VoteResult = {
  vote: { menuItemId: string; userId: string; value: number };
  stats: { up: number; mid: number; down: number; total: number };
};

/**
 * Cast or update a vote on a menu item.
 * - Enforces 1 vote per user per menu item (upsert).
 * - Allows voting only for today's dishes.
 * - Returns the updated stats.
 */
export async function castVote(
  menuItemId: string,
  userId: string,
  value: number
): Promise<{ data?: VoteResult; error?: string }> {
  // Validate vote value
  if (![-1, 0, 1].includes(value)) {
    return { error: "Vote value must be -1, 0, or 1" };
  }

  // Check menu item exists and get day date
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: menuItemId },
    include: {
      menuDay: {
        select: {
          date: true,
          isOpen: true,
          weekMenu: {
            select: {
              status: true,
            },
          },
        },
      },
    },
  });

  if (!menuItem) {
    return { error: "Menu item not found" };
  }

  if (menuItem.menuDay.weekMenu.status !== "PUBLISHED") {
    return { error: "Cannot vote on unpublished menu" };
  }

  if (!menuItem.menuDay.isOpen) {
    return { error: "This day is closed" };
  }

  if (!isToday(menuItem.menuDay.date)) {
    return { error: "Voting is only allowed for today's dishes" };
  }

  // Upsert the vote
  const vote = await prisma.vote.upsert({
    where: {
      menuItemId_userId: {
        menuItemId,
        userId,
      },
    },
    create: {
      menuItemId,
      userId,
      value,
    },
    update: {
      value,
    },
  });

  // Compute updated stats
  const stats = await computeStats(menuItemId);

  return {
    data: {
      vote: { menuItemId: vote.menuItemId, userId: vote.userId, value: vote.value },
      stats,
    },
  };
}

/**
 * Compute aggregated vote stats for a menu item.
 */
export async function computeStats(menuItemId: string) {
  const votes = await prisma.vote.findMany({
    where: { menuItemId },
    select: { value: true },
  });

  const stats = { up: 0, mid: 0, down: 0, total: votes.length };
  for (const v of votes) {
    if (v.value === 1) stats.up++;
    else if (v.value === 0) stats.mid++;
    else if (v.value === -1) stats.down++;
  }

  return stats;
}
