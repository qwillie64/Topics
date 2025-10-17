// src/context/FavoritesContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const Ctx = createContext(undefined);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem("favorites:list");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem("favorites:list", JSON.stringify(favorites)); } catch {}
  }, [favorites]);

  const addToFavorites = (event) => {
    setFavorites((prev) => (prev.some((e) => e.id === event.id) ? prev : [...prev, event]));
  };

  const removeFromFavorites = (id) => {
    setFavorites((prev) => prev.filter((e) => e.id !== id));
  };

  const isFavorite = (id) => favorites.some((e) => e.id === id);

  const value = useMemo(() => ({
    favorites, addToFavorites, removeFromFavorites, isFavorite
  }), [favorites]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFavorites() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // 提示：若忘了包 Provider，就丟出明確錯誤，避免 undefined 解構
    throw new Error("useFavorites must be used within <FavoritesProvider>");
  }
  return ctx;
}
