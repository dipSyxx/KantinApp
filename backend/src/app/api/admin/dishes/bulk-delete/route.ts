import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth";
import { validateBody } from "@/lib/validate";

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1).max(100),
});

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, ["CANTEEN_ADMIN", "SCHOOL_ADMIN"]);
  if (roleError) return roleError;

  const result = await validateBody(request, bulkDeleteSchema);
  if (result.error) return result.error;

  const { ids } = result.data;

  const dishes = await prisma.dish.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      menuItems: {
        where: {
          menuDay: {
            weekMenu: { status: { in: ["PUBLISHED", "DRAFT"] } },
          },
        },
        select: { id: true },
      },
    },
  });

  const warnings: string[] = [];
  for (const dish of dishes) {
    if (dish.menuItems.length > 0) {
      warnings.push(
        `"${dish.title}" er brukt i ${dish.menuItems.length} aktive menyer`
      );
    }
  }

  for (const dish of dishes) {
    if (dish.imageUrl?.includes(".vercel-storage.com")) {
      try {
        await del(dish.imageUrl);
      } catch {
        // ignore
      }
    }
  }

  const { count } = await prisma.dish.deleteMany({
    where: { id: { in: ids } },
  });

  return NextResponse.json({ deleted: count, warnings });
}
