export type AllergenKey =
  | "gluten"
  | "melk"
  | "egg"
  | "fisk"
  | "skalldyr"
  | "soya"
  | "nøtter"
  | "selleri"
  | "sennep"
  | "sesam"
  | "sulfitt"
  | "lupin";

export const ALLERGEN_LABELS: Record<string, string> = {
  gluten: "Gluten",
  melk: "Melk",
  egg: "Egg",
  fisk: "Fisk",
  skalldyr: "Skalldyr",
  soya: "Soya",
  nøtter: "Nøtter",
  selleri: "Selleri",
  sennep: "Sennep",
  sesam: "Sesam",
  sulfitt: "Sulfitt",
  lupin: "Lupin",
};

export const TAG_LABELS: Record<string, { label: string; color: string }> = {
  vegan: { label: "Vegan", color: "#43A047" },
  vegetar: { label: "Vegetar", color: "#66BB6A" },
  vegetarian: { label: "Vegetar", color: "#66BB6A" },
  halal: { label: "Halal", color: "#42A5F5" },
  spicy: { label: "Krydret", color: "#EF5350" },
  popular: { label: "Populær", color: "#FFB300" },
  dessert: { label: "Dessert", color: "#AB47BC" },
  breakfast: { label: "Frokost", color: "#F59E0B" },
  lunch: { label: "Lunsj", color: "#10B981" },
  dinner: { label: "Middag", color: "#3B82F6" },
  soup: { label: "Suppe", color: "#F97316" },
  salad: { label: "Salat", color: "#22C55E" },
  fish: { label: "Fisk", color: "#0EA5E9" },
  chicken: { label: "Kylling", color: "#EAB308" },
  beef: { label: "Storfe", color: "#B45309" },
  kids: { label: "Barn", color: "#EC4899" },
  healthy: { label: "Sunn", color: "#14B8A6" },
  seasonal: { label: "Sesong", color: "#84CC16" },
  new: { label: "Nyhet", color: "#6366F1" },
  glutenfree: { label: "Glutenfri", color: "#06B6D4" },
  gluten_free: { label: "Glutenfri", color: "#06B6D4" },
  lactosefree: { label: "Laktosefri", color: "#8B5CF6" },
  lactose_free: { label: "Laktosefri", color: "#8B5CF6" },
  nutfree: { label: "Nøttefri", color: "#A855F7" },
  nut_free: { label: "Nøttefri", color: "#A855F7" },
};

const TAG_BADGE_TEXT_COLOR = "#1B7A3D";
const TAG_BADGE_BACKGROUND_COLOR = "#E8F5EC";

export function getTagAppearance(
  tag: string,
): { label: string; color: string; backgroundColor: string } {
  const config = TAG_LABELS[tag];
  const label = config?.label ?? prettifyTagLabel(tag);

  return {
    label,
    color: TAG_BADGE_TEXT_COLOR,
    backgroundColor: TAG_BADGE_BACKGROUND_COLOR,
  };
}

export function prettifyTagLabel(value: string): string {
  const cleaned = value.replace(/[_-]+/g, " ").trim();
  if (!cleaned) {
    return value;
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
