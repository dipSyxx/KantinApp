import type { CatalogDish } from "@/api/types";
import { ALLERGEN_LABELS, TAG_LABELS, prettifyTagLabel } from "@/constants/allergens";

export type DishesViewMode = "list" | "grid";

export type DishesSortOption =
  | "newest"
  | "oldest"
  | "priceAsc"
  | "priceDesc"
  | "titleAsc";

export type DishesPriceBucket = "all" | "under50" | "50to80" | "80to100" | "over100";

export type DishesFilterState = {
  tags: string[];
  allergens: string[];
  priceBucket: DishesPriceBucket;
  sort: DishesSortOption;
};

export type ActiveFilterChip =
  | { id: string; kind: "tag"; value: string; label: string }
  | { id: string; kind: "allergen"; value: string; label: string }
  | { id: string; kind: "price"; value: DishesPriceBucket; label: string };

export const SORT_OPTIONS: Array<{ value: DishesSortOption; label: string }> = [
  { value: "newest", label: "Nyeste først" },
  { value: "oldest", label: "Eldste først" },
  { value: "priceAsc", label: "Pris lav-høy" },
  { value: "priceDesc", label: "Pris høy-lav" },
  { value: "titleAsc", label: "A-Z" },
];

export const PRICE_BUCKET_OPTIONS: Array<{ value: DishesPriceBucket; label: string }> = [
  { value: "all", label: "Alle priser" },
  { value: "under50", label: "Under 50 kr" },
  { value: "50to80", label: "50-80 kr" },
  { value: "80to100", label: "80-100 kr" },
  { value: "over100", label: "Over 100 kr" },
];

export function createDefaultDishesFilters(): DishesFilterState {
  return {
    tags: [],
    allergens: [],
    priceBucket: "all",
    sort: "newest",
  };
}

export function getAvailableTags(dishes: CatalogDish[]): string[] {
  const tags = new Set<string>();

  for (const dish of dishes) {
    for (const tag of dish.tags) {
      tags.add(tag);
    }
  }

  return Array.from(tags).sort((a, b) => {
    const labelA = TAG_LABELS[a]?.label ?? prettifyTagLabel(a);
    const labelB = TAG_LABELS[b]?.label ?? prettifyTagLabel(b);
    return labelA.localeCompare(labelB, "nb");
  });
}

export function getAvailableAllergens(dishes: CatalogDish[]): string[] {
  const allergens = new Set<string>();

  for (const dish of dishes) {
    for (const allergen of dish.allergens) {
      allergens.add(allergen);
    }
  }

  return Array.from(allergens).sort((a, b) => {
    const labelA = ALLERGEN_LABELS[a] ?? a;
    const labelB = ALLERGEN_LABELS[b] ?? b;
    return labelA.localeCompare(labelB, "nb");
  });
}

export function applyDishFilters(dishes: CatalogDish[], filters: DishesFilterState): CatalogDish[] {
  return dishes.filter((dish) => {
    const tagsMatch =
      filters.tags.length === 0 || dish.tags.some((tag) => filters.tags.includes(tag));
    const allergensMatch =
      filters.allergens.length === 0 ||
      dish.allergens.some((allergen) => filters.allergens.includes(allergen));
    const priceMatch = matchesPriceBucket(dish.latestPrice, filters.priceBucket);

    return tagsMatch && allergensMatch && priceMatch;
  });
}

export function applyDishSort(dishes: CatalogDish[], sort: DishesSortOption): CatalogDish[] {
  const sorted = [...dishes];

  sorted.sort((a, b) => {
    switch (sort) {
      case "newest":
        return compareByDateDesc(a, b);
      case "oldest":
        return compareByDateAsc(a, b);
      case "priceAsc":
        return compareByPrice(a, b, "asc");
      case "priceDesc":
        return compareByPrice(a, b, "desc");
      case "titleAsc":
        return compareByTitle(a, b);
      default:
        return compareByDateDesc(a, b);
    }
  });

  return sorted;
}

export function getActiveFilterCount(filters: DishesFilterState): number {
  const tagsCount = filters.tags.length;
  const allergensCount = filters.allergens.length;
  const priceCount = filters.priceBucket === "all" ? 0 : 1;
  return tagsCount + allergensCount + priceCount;
}

export function buildActiveFilterChips(filters: DishesFilterState): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  for (const tag of filters.tags) {
    chips.push({
      id: `tag:${tag}`,
      kind: "tag",
      value: tag,
      label: TAG_LABELS[tag]?.label ?? prettifyTagLabel(tag),
    });
  }

  for (const allergen of filters.allergens) {
    chips.push({
      id: `allergen:${allergen}`,
      kind: "allergen",
      value: allergen,
      label: ALLERGEN_LABELS[allergen] ?? allergen,
    });
  }

  if (filters.priceBucket !== "all") {
    chips.push({
      id: `price:${filters.priceBucket}`,
      kind: "price",
      value: filters.priceBucket,
      label: getPriceBucketLabel(filters.priceBucket),
    });
  }

  return chips;
}

export function removeSingleFilter(
  filters: DishesFilterState,
  chip: ActiveFilterChip
): DishesFilterState {
  if (chip.kind === "tag") {
    return {
      ...filters,
      tags: filters.tags.filter((tag) => tag !== chip.value),
    };
  }

  if (chip.kind === "allergen") {
    return {
      ...filters,
      allergens: filters.allergens.filter((allergen) => allergen !== chip.value),
    };
  }

  return {
    ...filters,
    priceBucket: "all",
  };
}

export function toggleSelection(values: string[], nextValue: string): string[] {
  if (values.includes(nextValue)) {
    return values.filter((value) => value !== nextValue);
  }

  return [...values, nextValue];
}

export function getPriceBucketLabel(bucket: DishesPriceBucket): string {
  return PRICE_BUCKET_OPTIONS.find((item) => item.value === bucket)?.label ?? bucket;
}

function matchesPriceBucket(price: number | null, bucket: DishesPriceBucket): boolean {
  if (bucket === "all") {
    return true;
  }

  if (price === null) {
    return false;
  }

  switch (bucket) {
    case "under50":
      return price < 50;
    case "50to80":
      return price >= 50 && price <= 80;
    case "80to100":
      return price > 80 && price <= 100;
    case "over100":
      return price > 100;
    default:
      return true;
  }
}

function compareByDateDesc(a: CatalogDish, b: CatalogDish): number {
  const dateA = Date.parse(a.createdAt);
  const dateB = Date.parse(b.createdAt);
  if (dateA !== dateB) {
    return dateB - dateA;
  }

  return compareByTitle(a, b);
}

function compareByDateAsc(a: CatalogDish, b: CatalogDish): number {
  const dateA = Date.parse(a.createdAt);
  const dateB = Date.parse(b.createdAt);
  if (dateA !== dateB) {
    return dateA - dateB;
  }

  return compareByTitle(a, b);
}

function compareByPrice(a: CatalogDish, b: CatalogDish, direction: "asc" | "desc"): number {
  const priceA = a.latestPrice;
  const priceB = b.latestPrice;

  if (priceA === null && priceB === null) {
    return compareByTitle(a, b);
  }

  if (priceA === null) {
    return 1;
  }

  if (priceB === null) {
    return -1;
  }

  if (priceA !== priceB) {
    return direction === "asc" ? priceA - priceB : priceB - priceA;
  }

  return compareByTitle(a, b);
}

function compareByTitle(a: CatalogDish, b: CatalogDish): number {
  return a.title.localeCompare(b.title, "nb");
}
