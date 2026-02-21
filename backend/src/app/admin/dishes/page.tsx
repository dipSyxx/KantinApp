import { prisma } from "@/lib/db";
import { UtensilsCrossed, ImageIcon, AlertTriangle, FileText } from "lucide-react";
import { CreateDishForm } from "./CreateDishForm";
import { DishList } from "./DishList";

export const dynamic = "force-dynamic";

export default async function DishesPage() {
  const dishes = await prisma.dish.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { menuItems: true } },
    },
  });

  const withImage = dishes.filter((d) => d.imageUrl).length;
  const withoutDesc = dishes.filter((d) => !d.description).length;
  const uniqueAllergens = new Set(dishes.flatMap((d) => d.allergens));

  const serialized = dishes.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    imageUrl: d.imageUrl,
    allergens: d.allergens,
    tags: d.tags,
    createdAt: d.createdAt.toISOString(),
    _count: d._count,
  }));

  if (dishes.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Retter</h1>
        </div>
        <CreateDishForm />
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-4">
            <UtensilsCrossed className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Ingen retter ennå</h2>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Opprett din første rett ved å klikke &quot;+ Ny rett&quot; knappen ovenfor.
            Retter kan legges til ukemenyer og elevene kan stemme på dem.
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Retter totalt", value: dishes.length, icon: UtensilsCrossed, color: "text-brand-green", bg: "bg-brand-green-50" },
    { label: "Med bilde", value: withImage, icon: ImageIcon, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Allergener", value: uniqueAllergens.size, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Uten beskrivelse", value: withoutDesc, icon: FileText, color: "text-gray-500", bg: "bg-gray-100" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Retter</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3"
          >
            <div className={`${s.bg} rounded-lg p-2`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <CreateDishForm />

      <DishList dishes={serialized} />
    </div>
  );
}
