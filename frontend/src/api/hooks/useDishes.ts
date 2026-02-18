import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import type { CatalogDish } from "../types";

export function useDishes() {
  return useQuery<CatalogDish[]>({
    queryKey: ["dishes"],
    queryFn: async () => {
      const { data } = await api.get("/api/dishes");
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
