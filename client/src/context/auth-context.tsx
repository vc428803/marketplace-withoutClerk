import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

import {
  AuthContext,
  type User,
  type AuthContextType,
} from "./auth-context-def";

interface AuthProviderProps {
  children: ReactNode;
}

interface MeResponse {
  user: User;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:8080/auth/me", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Authentication failed");
      }

      const data = (await res.json()) as MeResponse;

      setIsAuthenticated(true);
      setUserInfo(data.user);

      return true;
    } catch {
      setIsAuthenticated(false);
      setUserInfo(null);
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    setAuthLoading(true);
    return checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    isAuthenticated,
    userInfo,
    authLoading,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
