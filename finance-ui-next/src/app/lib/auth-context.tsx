'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';            // axios instance

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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  /* ---------- login ---------- */
  const login = (token: string) => {
    sessionStorage.setItem('accessToken', token);
    setUser(jwtDecode<User>(token));
    router.push('/dashboard');
  };

  /* ---------- logout ---------- */
  const logout = async () => {
    try {
      await api.post('/auth/logout');       // clears cookie on the server
    } catch {
      /* ignore network errors – cookie may already be gone */
    }
    sessionStorage.removeItem('accessToken');
    setUser(null);
    router.push('/login');
  };

  /* decode token once on first render */
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (token) setUser(jwtDecode<User>(token));
  }, []);

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
