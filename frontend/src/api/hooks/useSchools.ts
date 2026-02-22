import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import type { SchoolInfo } from "../types";

export function useSchools() {
  return useQuery<SchoolInfo[]>({
    queryKey: ["schools"],
    queryFn: async () => {
      const { data } = await api.get("/api/schools");
      return data;
    },
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
  });
}
