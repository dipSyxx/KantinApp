import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { WeekActions } from "./WeekActions";
import { AddMenuItem } from "./AddMenuItem";
import { DeleteMenuItemButton } from "./DeleteMenuItemButton";

export const dynamic = "force-dynamic";

type SearchParams = {
  edit?: string | string[];
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<SearchParams>;
};

export default async function WeekDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const editParam = resolvedSearchParams.edit;
  const isEditMode = Array.isArray(editParam) ? editParam.includes("1") : editParam === "1";

  const weekMenu = await prisma.weekMenu.findUnique({
    where: { id },
    include: {
      days: {
        orderBy: { date: "asc" },
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
            include: {
              dish: true,
              _count: { select: { votes: true } },
            },
          },
        },
      },
    },
  });

  if (!weekMenu) return notFound();

  const canEdit =
    weekMenu.status === "DRAFT" ||
    (weekMenu.status === "PUBLISHED" && isEditMode);

  const dishes = await prisma.dish.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true, imageUrl: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Uke {weekMenu.weekNumber}, {weekMenu.year}
          </h1>
          <p className="text-gray-500 mt-1">
            Status:{" "}
            <span
              className={`font-bold ${
                weekMenu.status === "PUBLISHED"
                  ? "text-emerald-600"
                  : weekMenu.status === "DRAFT"
                  ? "text-yellow-600"
                  : "text-gray-500"
              }`}
            >
              {weekMenu.status === "DRAFT"
                ? "Utkast"
                : weekMenu.status === "PUBLISHED"
                ? "Publisert"
                : "Arkivert"}
            </span>
          </p>

          {weekMenu.status === "PUBLISHED" && isEditMode && (
            <p className="inline-flex mt-3 text-sm font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
              Redigeringsmodus er aktiv. Endringer lagres umiddelbart.
            </p>
          )}
        </div>
        <WeekActions
          weekMenuId={weekMenu.id}
          status={weekMenu.status}
          isEditMode={isEditMode}
        />
      </div>

      {/* Days */}
      <div className="space-y-6">
        {weekMenu.days.map((day) => (
          <div
            key={day.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible"
          >
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="font-bold">
                  {(() => {
                    const d = new Date(day.date);
                    const days = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
                    const months = [
                      "januar",
                      "februar",
                      "mars",
                      "april",
                      "mai",
                      "juni",
                      "juli",
                      "august",
                      "september",
                      "oktober",
                      "november",
                      "desember",
                    ];
                    return `${days[d.getUTCDay()]} ${d.getUTCDate()}. ${months[d.getUTCMonth()]}`;
                  })()}
                </span>
                {!day.isOpen && (
                  <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                    Stengt
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {day.items.length} retter
              </span>
            </div>

            <div className="p-4">
              {/* Existing items */}
              {day.items.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {day.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        {item.dish.imageUrl ? (
                          <img
                            src={item.dish.imageUrl}
                            alt={item.dish.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-200 text-gray-500 border border-gray-200 flex items-center justify-center text-xs font-semibold">
                            {item.dish.title.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-sm">
                            {item.dish.title}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">
                              {item.price} kr
                            </span>
                            <span className="text-xs px-1.5 py-0.5 bg-gray-200 rounded font-medium">
                              {item.category}
                            </span>
                            {item.status !== "ACTIVE" && (
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                  item.status === "SOLD_OUT"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {item.status === "SOLD_OUT"
                                  ? "Utsolgt"
                                  : "Endret"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {canEdit ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {item._count.votes} stemmer
                          </span>
                          <DeleteMenuItemButton
                            menuItemId={item.id}
                            dishTitle={item.dish.title}
                            voteCount={item._count.votes}
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {item._count.votes} stemmer
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">
                  Ingen retter lagt til
                </p>
              )}

              {/* Add menu item form */}
              {canEdit && (
                <AddMenuItem
                  menuDayId={day.id}
                  dishes={dishes}
                  existingDishIds={day.items.map((item) => item.dishId)}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
