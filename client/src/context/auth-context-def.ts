import { createContext } from "react";

export interface User {
  id: number;
  email: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: User | null;
  authLoading: boolean;
  refreshAuth: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
