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
  halal: { label: "Halal", color: "#42A5F5" },
  spicy: { label: "Krydret", color: "#EF5350" },
  popular: { label: "Populær", color: "#FFB300" },
  dessert: { label: "Dessert", color: "#AB47BC" },
};
