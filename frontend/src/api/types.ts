// ─── API Response Types ─────────────────────────────────

export type Dish = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  allergens: string[];
  tags: string[];
};

export type CatalogDish = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  allergens: string[];
  tags: string[];
  latestPrice: number | null;
  createdAt: string;
};

export type CatalogDishDetail = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  allergens: string[];
  tags: string[];
  latestPrice: number | null;
};

export type MenuItemSummary = {
  id: string;
  price: number;
  category: "MAIN" | "VEG" | "SOUP" | "DESSERT" | "OTHER";
  status: "ACTIVE" | "CHANGED" | "SOLD_OUT";
  dish: Dish;
  voteCount: number;
};

export type MenuDay = {
  id: string;
  date: string; // YYYY-MM-DD
  isOpen: boolean;
  notes: string | null;
  items: MenuItemSummary[];
};

export type WeekMenuResponse = {
  id: string;
  year: number;
  weekNumber: number;
  status: string;
  publishedAt: string | null;
  days: MenuDay[];
};

export type VoteStats = {
  up: number;
  mid: number;
  down: number;
  total: number;
};

export type MenuItemDetail = {
  id: string;
  price: number;
  category: string;
  status: string;
  dish: Dish;
  day: {
    date: string;
    isOpen: boolean;
    notes: string | null;
  };
  canVote: boolean;
  voteLockedReason: string | null;
  stats: VoteStats;
  myVote: number | null;
};

export type VoteResponse = {
  vote: {
    menuItemId: string;
    userId: string;
    value: number;
  };
  stats: VoteStats;
};

export type SchoolInfo = {
  id: string;
  name: string;
  slug: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId: string | null;
  school: SchoolInfo | null;
};

export type AuthResponse = {
  ok: boolean;
  user: AuthUser;
};
