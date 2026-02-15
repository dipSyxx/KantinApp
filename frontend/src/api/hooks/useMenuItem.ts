import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import type { MenuItemDetail } from "../types";

export function useMenuItem(id: string) {
  return useQuery<MenuItemDetail>({
    queryKey: ["menuItem", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/menu-item/${id}`);
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!id,
  });
}
