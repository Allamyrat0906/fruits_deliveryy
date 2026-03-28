import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User, useGetCurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const authHeaders = () => {
  const token = localStorage.getItem("fruit_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("fruit_token"));
  const queryClient = useQueryClient();

  // Validate token and get user
  const { data: user, isLoading } = useGetCurrentUser({
    request: { headers: authHeaders() }
  });

  useEffect(() => {
    // If token exists but fetch fails (e.g., expired), clear token
    if (token && !isLoading && !user) {
      localStorage.removeItem("fruit_token");
      setToken(null);
    }
  }, [user, isLoading, token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("fruit_token", newToken);
    setToken(newToken);
    queryClient.setQueryData(getGetCurrentUserQueryKey(), newUser);
  };

  const logout = () => {
    localStorage.removeItem("fruit_token");
    setToken(null);
    queryClient.setQueryData(getGetCurrentUserQueryKey(), null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user: user || null, token, isLoading, login, logout }}>
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
