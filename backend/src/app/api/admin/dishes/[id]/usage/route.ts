import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth";
import { notFound } from "@/lib/errors";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, ["CANTEEN_ADMIN", "SCHOOL_ADMIN"]);
  if (roleError) return roleError;

  const dish = await prisma.dish.findUnique({ where: { id } });
  if (!dish) return notFound("Dish not found");

  const menuItems = await prisma.menuItem.findMany({
    where: { dishId: id },
    include: {
      menuDay: {
        include: {
          weekMenu: { select: { id: true, year: true, weekNumber: true, status: true } },
        },
      },
      _count: { select: { votes: true } },
      votes: { select: { value: true } },
    },
    orderBy: { menuDay: { date: "desc" } },
  });

  const usage = menuItems.map((mi) => {
    const totalVotes = mi._count.votes;
    const positiveVotes = mi.votes.filter((v) => v.value === 1).length;
    const avgRating =
      totalVotes > 0
        ? mi.votes.reduce((sum, v) => sum + v.value, 0) / totalVotes
        : null;

    return {
      menuItemId: mi.id,
      date: mi.menuDay.date,
      weekLabel: `Uke ${mi.menuDay.weekMenu.weekNumber}, ${mi.menuDay.weekMenu.year}`,
      weekStatus: mi.menuDay.weekMenu.status,
      price: mi.price,
      category: mi.category,
      totalVotes,
      positiveVotes,
      avgRating,
    };
  });

  return NextResponse.json({ dishTitle: dish.title, usage });
}
