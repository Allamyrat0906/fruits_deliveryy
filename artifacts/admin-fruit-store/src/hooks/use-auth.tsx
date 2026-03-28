import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User, useGetCurrentUser, getGetCurrentUserQueryKey, setAuthTokenGetter } from "@workspace/api-client-react";

const TOKEN_KEY = "fruit_token";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

setAuthTokenGetter(() => localStorage.getItem(TOKEN_KEY));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useGetCurrentUser({
    query: { enabled: !!token },
  });

  useEffect(() => {
    if (token && !isLoading && !user) {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      queryClient.setQueryData(getGetCurrentUserQueryKey(), null);
    }
  }, [user, isLoading, token, queryClient]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setAuthTokenGetter(() => newToken);
    queryClient.setQueryData(getGetCurrentUserQueryKey(), newUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setAuthTokenGetter(() => null);
    queryClient.clear();
    window.location.reload();
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
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
