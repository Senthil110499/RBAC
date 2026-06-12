import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { Role, User } from "../types";

interface AuthContextProps {
  user: User | null;
  token: string | null;
  loading: boolean; // ✅ new
  login: (payload: { token: string; user: User }) => void;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // ✅ start as loading

  const login: AuthContextProps["login"] = ({ token, user }) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setLoading(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const hasRole = (...roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) {
      setToken(t);
      try {
        setUser(JSON.parse(u));
      } catch {}
    }
    setLoading(false); // ✅ important
  }, []);

  const value = useMemo(
    () => ({ user, token, login, logout, hasRole, loading }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
