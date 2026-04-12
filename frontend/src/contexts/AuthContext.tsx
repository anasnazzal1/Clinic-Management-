import React, { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '@/lib/api';

export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'patient';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  email: string;
  linkedId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function normalizeStoredUser(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') return null;
  const u = raw as Record<string, unknown>;
  const id = u.id ?? u._id;
  if (typeof u.role !== 'string' || id == null) return null;
  return {
    id: String(id),
    username: String(u.username ?? ''),
    role: u.role as UserRole,
    name: String(u.name ?? ''),
    email: String(u.email ?? ''),
    linkedId: u.linkedId != null ? String(u.linkedId) : undefined,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('clinicUser');
    if (!stored) return null;
    try {
      return normalizeStoredUser(JSON.parse(stored));
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { data } = await authApi.login(email, password);
      if (!data?.accessToken || !data.user) return false;
      const u = data.user as Record<string, unknown>;
      const normalized: User = {
        id: String(u._id ?? u.id ?? ''),
        username: String(u.username ?? ''),
        role: u.role as UserRole,
        name: String(u.name ?? ''),
        email: String(u.email ?? ''),
        linkedId: u.linkedId != null ? String(u.linkedId) : undefined,
      };
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('clinicUser', JSON.stringify(normalized));
      setUser(normalized);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('clinicUser');
    localStorage.removeItem('token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const getRolePath = (role: UserRole) => {
  const paths: Record<UserRole, string> = {
    admin: '/admin',
    doctor: '/doctor',
    receptionist: '/reception',
    patient: '/patient',
  };
  return paths[role];
};
