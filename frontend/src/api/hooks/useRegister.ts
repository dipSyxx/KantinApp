import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import type { AuthResponse } from "../types";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  schoolId: string;
};

type RegisterResponse = {
  ok: boolean;
  expiresAt: string;
};

type VerifyInput = {
  email: string;
  code: string;
};

export function useRegister() {
  return useMutation<RegisterResponse, Error, RegisterInput>({
    mutationFn: async ({ name, email, password, schoolId }) => {
      const { data } = await api.post("/api/auth/register", {
        name,
        email,
        password,
        schoolId,
      });
      return data;
    },
  });
}

export function useVerify() {
  return useMutation<AuthResponse, Error, VerifyInput>({
    mutationFn: async ({ email, code }) => {
      const { data } = await api.post("/api/auth/verify", { email, code });
      return data;
    },
  });
}
