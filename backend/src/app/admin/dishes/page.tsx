import { prisma } from "@/lib/db";
import { CreateDishForm } from "./CreateDishForm";
import { DishCard } from "./DishCard";

export const dynamic = "force-dynamic";

export default async function DishesPage() {
  const dishes = await prisma.dish.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { menuItems: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Retter</h1>
        <span className="text-sm text-gray-400">{dishes.length} retter totalt</span>
      </div>

      {/* Create form */}
      <CreateDishForm />

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} />
        ))}

        {dishes.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400">
            Ingen retter opprettet ennå
          </div>
        )}
      </div>
    </div>
  );
}
