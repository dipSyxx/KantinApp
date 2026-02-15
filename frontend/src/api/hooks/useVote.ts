import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import type { VoteResponse, MenuItemDetail } from "../types";

type VoteInput = {
  menuItemId: string;
  value: number;
  isUpdate?: boolean;
};

type VoteContext = {
  previousData: MenuItemDetail | undefined;
};

export function useVote() {
  const queryClient = useQueryClient();

  return useMutation<VoteResponse, Error, VoteInput, VoteContext>({
    mutationFn: async ({ menuItemId, value, isUpdate }) => {
      if (isUpdate) {
        const { data } = await api.patch(`/api/votes/${menuItemId}`, { value });
        return data;
      } else {
        const { data } = await api.post("/api/votes", { menuItemId, value });
        return data;
      }
    },

    // Optimistic update
    onMutate: async ({ menuItemId, value }): Promise<VoteContext> => {
      await queryClient.cancelQueries({ queryKey: ["menuItem", menuItemId] });

      const previousData = queryClient.getQueryData<MenuItemDetail>([
        "menuItem",
        menuItemId,
      ]);

      if (previousData) {
        const oldVote = previousData.myVote;
        const newStats = { ...previousData.stats };

        // Decrement old vote count
        if (oldVote === 1) newStats.up--;
        else if (oldVote === 0) newStats.mid--;
        else if (oldVote === -1) newStats.down--;
        else newStats.total++; // New vote, increase total

        // Increment new vote count
        if (value === 1) newStats.up++;
        else if (value === 0) newStats.mid++;
        else if (value === -1) newStats.down++;

        queryClient.setQueryData<MenuItemDetail>(["menuItem", menuItemId], {
          ...previousData,
          myVote: value,
          stats: newStats,
        });
      }

      return { previousData };
    },

    onError: (_err, { menuItemId }, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(["menuItem", menuItemId], context.previousData);
      }
    },

    onSettled: (_data, _err, { menuItemId }) => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: ["menuItem", menuItemId] });
    },
  });
}
