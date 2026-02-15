import { prisma } from "@/lib/db";
import { CreateDishForm } from "./CreateDishForm";

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
      <h1 className="text-3xl font-bold mb-8">Retter</h1>

      {/* Create form */}
      <CreateDishForm />

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dishes.map((dish) => (
          <div
            key={dish.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {dish.imageUrl && (
              <img
                src={dish.imageUrl}
                alt={dish.title}
                className="w-full h-36 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-bold text-base mb-1">{dish.title}</h3>
              {dish.description && (
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                  {dish.description}
                </p>
              )}

              {/* Allergens */}
              {dish.allergens.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {dish.allergens.map((a) => (
                    <span
                      key={a}
                      className="text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full border border-red-200"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}

              {/* Tags */}
              {dish.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {dish.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-400 mt-2">
                Brukt i {dish._count.menuItems} menyer
              </div>
            </div>
          </div>
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
