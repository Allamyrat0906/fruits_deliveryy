import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User, useGetCurrentUser, getGetCurrentUserQueryKey, setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get auth headers manually (for hooks that need request config)
export const authHeaders = () => {
  const token = localStorage.getItem("fruit_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Set up global auth token getter so ALL API calls get the token automatically
setAuthTokenGetter(() => localStorage.getItem("fruit_token"));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("fruit_token"));
  const queryClient = useQueryClient();

  // Only fetch /api/auth/me when we have a token — avoids unnecessary 401 errors
  const { data: user, isLoading } = useGetCurrentUser({
    request: { headers: authHeaders() },
    query: { enabled: !!token },
  });

  useEffect(() => {
    // If token exists but the user fetch failed (expired/invalid), clear it
    if (token && !isLoading && !user) {
      localStorage.removeItem("fruit_token");
      setToken(null);
      queryClient.setQueryData(getGetCurrentUserQueryKey(), null);
    }
  }, [user, isLoading, token, queryClient]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("fruit_token", newToken);
    setToken(newToken);
    // Update auth token getter immediately
    setAuthTokenGetter(() => newToken);
    queryClient.setQueryData(getGetCurrentUserQueryKey(), newUser);
  };

  const logout = () => {
    localStorage.removeItem("fruit_token");
    setToken(null);
    setAuthTokenGetter(() => null);
    queryClient.setQueryData(getGetCurrentUserQueryKey(), null);
    queryClient.clear();
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{ user: user || null, token, isLoading: token ? isLoading : false, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
