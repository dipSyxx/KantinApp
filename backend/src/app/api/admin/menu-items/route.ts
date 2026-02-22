import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { conflict, notFound } from "@/lib/errors";

const createMenuItemSchema = z.object({
  menuDayId: z.string().min(1),
  dishId: z.string().min(1),
  price: z.number().int().min(0).default(50),
  category: z.enum(["MAIN", "VEG", "SOUP", "DESSERT", "OTHER"]).default("MAIN"),
  sortOrder: z.number().int().default(0),
});

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, ["CANTEEN_ADMIN", "SCHOOL_ADMIN", "SUPER_ADMIN"]);
  if (roleError) return roleError;

  const result = await validateBody(request, createMenuItemSchema);
  if (result.error) return result.error;

  // Verify menu day exists
  const menuDay = await prisma.menuDay.findUnique({
    where: { id: result.data.menuDayId },
    include: {
      weekMenu: {
        select: { status: true },
      },
    },
  });
  if (!menuDay) return notFound("Menu day not found");

  if (menuDay.weekMenu.status === "ARCHIVED") {
    return conflict("Kan ikke redigere en arkivert ukemeny");
  }

  // Verify dish exists
  const dish = await prisma.dish.findUnique({
    where: { id: result.data.dishId },
  });
  if (!dish) return notFound("Dish not found");

  const duplicate = await prisma.menuItem.findFirst({
    where: {
      menuDayId: result.data.menuDayId,
      dishId: result.data.dishId,
    },
    select: { id: true },
  });

  if (duplicate) {
    return conflict("Denne retten er allerede lagt til for denne dagen");
  }

  const menuItem = await prisma.menuItem.create({
    data: result.data,
    include: { dish: true },
  });

  return NextResponse.json(menuItem, { status: 201 });
}
