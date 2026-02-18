import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import {
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  setStoredUser,
  clearAuth,
} from "@/lib/auth";
import type { AuthResponse } from "../types";

type LoginInput = {
  email: string;
  password: string;
};

export function useLogin() {
  return useMutation<AuthResponse, Error, LoginInput>({
    mutationFn: async ({ email, password }) => {
      const { data } = await api.post("/api/auth/login", { email, password });
      return data;
    },
    onSuccess: async (data) => {
      await setAccessToken(data.accessToken);
      await setRefreshToken(data.refreshToken);
      await setStoredUser(data.user);
    },
  });
}

export function useLogout() {
  return useMutation<void, Error>({
    mutationFn: async () => {
      try {
        const refreshToken = await getRefreshToken();
        await api.post("/api/auth/logout", refreshToken ? { refreshToken } : undefined);
      } catch {
        // Ignore network/server logout errors; local logout still proceeds.
      }
      await clearAuth();
    },
  });
}
