import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/api/client";
import type { AuthUser } from "@/api/types";

type AuthState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

type MeResponse = {
  user: AuthUser;
};

const AuthContext = createContext<AuthState>({
  isLoading: true,
  isAuthenticated: false,
  user: null,
  logout: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  const loadAuth = async () => {
    try {
      const { data } = await api.get<MeResponse>("/api/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuth();
  }, []);

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Ignore network/server logout errors.
    } finally {
      setUser(null);
    }
  };

  const refresh = async () => {
    setIsLoading(true);
    await loadAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated: !!user,
        user,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
