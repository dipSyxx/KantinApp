import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import type { CatalogDishDetail } from "../types";

export function useDish(id: string) {
  return useQuery<CatalogDishDetail>({
    queryKey: ["dish", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/dishes/${id}`);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
  });
}
