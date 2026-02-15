import React, { createContext, useContext, useEffect, useState } from "react";
import { getAccessToken, getStoredUser, clearAuth, type StoredUser } from "@/lib/auth";

type AuthState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: StoredUser | null;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
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
  const [user, setUser] = useState<StoredUser | null>(null);

  const loadAuth = async () => {
    try {
      const token = await getAccessToken();
      const storedUser = await getStoredUser();
      if (token && storedUser) {
        setUser(storedUser);
      } else {
        setUser(null);
      }
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
    await clearAuth();
    setUser(null);
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
