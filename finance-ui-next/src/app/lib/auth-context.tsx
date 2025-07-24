"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";

type User = { sub: string; email: string };

interface Ctx {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthCtx = createContext<Ctx>({
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (token: string) => {
    sessionStorage.setItem("accessToken", token);
    setUser(jwtDecode<User>(token));
  };

  const logout = () => {
    sessionStorage.removeItem("accessToken");
    setUser(null);
  };

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (token) setUser(jwtDecode<User>(token));
  }, []);

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
