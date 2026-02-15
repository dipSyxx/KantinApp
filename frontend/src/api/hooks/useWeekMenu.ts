import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import type { WeekMenuResponse } from "../types";

export function useWeekMenu(year: number, week: number) {
  return useQuery<WeekMenuResponse>({
    queryKey: ["weekMenu", year, week],
    queryFn: async () => {
      const { data } = await api.get("/api/menu/week", {
        params: { year, week },
      });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours cache
  });
}
