import { useState, useEffect, useCallback, useRef, type ReactNode } from "react";

import { apiUrl } from "../config/api";

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

  const authVersion = useRef(0);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    const version = authVersion.current;

    try {
      const res = await fetch(apiUrl("/auth/me"), {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Authentication failed");
      }

      const data = (await res.json()) as MeResponse;

      if (version !== authVersion.current) return false;

      setIsAuthenticated(true);
      setUserInfo(data.user);

      return true;
    } catch {
      if (version === authVersion.current) {
        setIsAuthenticated(false);
        setUserInfo(null);
      }
      return false;
    } finally {
      if (version === authVersion.current) {
        setAuthLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    setAuthLoading(true);
    return checkAuth();
  }, [checkAuth]);

  const logout = useCallback(async (): Promise<void> => {
    // 先使尚未完成的身分驗證請求失效
    authVersion.current += 1;
    setAuthLoading(true);

    try {
      const response = await fetch(apiUrl("/auth/logout"), {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Logout failed: ${response.status}`);
      }

      setIsAuthenticated(false);
      setUserInfo(null);
    } catch (error) {
      // 登出失敗時重新確認 Cookie 是否仍然有效
      await checkAuth();
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }, [checkAuth]);

  const value: AuthContextType = {
    isAuthenticated,
    userInfo,
    authLoading,
    refreshAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
