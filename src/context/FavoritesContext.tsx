import React, { ReactNode } from "react";

interface FavoriteCar {
  make: string;
  model: string;
}

interface FavoritesContextProps {
  favorites: FavoriteCar[];
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
      value={{ favorites, toggleFavorite, clearFavorites }}
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
