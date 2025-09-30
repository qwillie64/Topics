import { createContext, useContext, useState } from "react";

// 建立 Context
const FavoritesContext = createContext();

// Provider
export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  const addToFavorites = (event) => {
    // 如果已經收藏就不重複加入
    if (!favorites.find(e => e.id === event.id)) {
      setFavorites([...favorites, event]);
    }
  };

  const removeFromFavorites = (id) => {
    setFavorites(favorites.filter(e => e.id !== id));
  };

  const isFavorite = (id) => favorites.some(e => e.id === id);

  return (
    <FavoritesContext.Provider value={{ favorites, addToFavorites, removeFromFavorites, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// 自訂 Hook
export const useFavorites = () => useContext(FavoritesContext);
