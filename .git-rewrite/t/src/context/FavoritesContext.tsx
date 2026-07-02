import React, { ReactNode } from "react";

import {
  FavoriteCar,
  loadFavorites,
  saveFavorites,
} from "../services/favoritesStorage";

interface FavoritesContextProps {
  favorites: FavoriteCar[];
  isHydrated: boolean;
  toggleFavorite: (car: FavoriteCar) => void;
  clearFavorites: () => void;
}

const FavoritesContext = React.createContext<FavoritesContextProps | undefined>(
  undefined
);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = React.useState<FavoriteCar[]>([]);
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    const hydrateFavorites = async () => {
      const storedFavorites = await loadFavorites();
      setFavorites(storedFavorites);
      setIsHydrated(true);
    };

    hydrateFavorites();
  }, []);

  React.useEffect(() => {
    if (isHydrated) {
      saveFavorites(favorites);
    }
  }, [favorites, isHydrated]);

  const toggleFavorite = (car: FavoriteCar) => {
    setFavorites((prevFavorites) => {
      const isFavorite = prevFavorites.some(
        (fav) => fav.make === car.make && fav.model === car.model
      );
      if (isFavorite) {
        return prevFavorites.filter(
          (fav) => fav.make !== car.make || fav.model !== car.model
        );
      }
      return [...prevFavorites, car];
    });
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, isHydrated, toggleFavorite, clearFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = React.useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
