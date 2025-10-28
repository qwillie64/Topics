import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { login as apiLogin, logout as apiLogout } from "../api/account";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const cache = localStorage.getItem("auth:user");
      return cache ? JSON.parse(cache) : null;
    } catch { return null; }
  });
  const isAuthenticated = !!user;

  useEffect(() => {
    if (user) localStorage.setItem("auth:user", JSON.stringify(user));
    else localStorage.removeItem("auth:user");
  }, [user]);

  const login = useCallback(async ({ account, password }) => {
    // account 可能是 email 或使用者帳號，轉發給 API
    const res = await apiLogin({ account, password });
    const email = account;
    // 假設後端回 token 與使用者資料，你可依你的實際調整
    const emailVerified = res?.emailVerified !== false && res?.status !== "email_not_verified";
    const u = {
      id: res?.user?.id ?? res?.id,
      name: res?.user?.name ?? res?.name ?? (email ? email.split("@")[0] : account),
      email,
      emailVerified,
      token: res?.token,
      role: res?.user?.role ?? "user",
    };
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try { await apiLogout?.(); } catch {}
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, isAuthenticated, login, logout, setUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
