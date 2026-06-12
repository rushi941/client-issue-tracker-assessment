import { useEffect, useState, ReactNode } from "react";
import { api } from "../api/client";
import { User } from "../types";
import { AuthContext } from "./auth-context";
import { toastError, toastSuccess } from "@/lib/toast";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const me = await api<User>("/api/auth/me");
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await api<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(result.user);
    return result.user;
  };

  const logout = async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
      toastSuccess("Signed out successfully");
    } catch (e) {
      toastError(e, "Sign out failed");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}
