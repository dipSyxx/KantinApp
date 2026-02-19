import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
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
  });
}

export function useLogout() {
  return useMutation<void, Error>({
    mutationFn: async () => {
      await api.post("/api/auth/logout");
    },
  });
}
