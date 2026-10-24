import { createContext } from "react";

export interface User {
  id: string;
  email: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: User | null;
  authLoading: boolean;
  refreshAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
