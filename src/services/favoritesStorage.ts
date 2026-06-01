import AsyncStorage from "@react-native-async-storage/async-storage";

export interface FavoriteCar {
  make: string;
  model: string;
}

export const FAVORITES_STORAGE_KEY = "favoriteCars";

const isFavoriteCar = (value: unknown): value is FavoriteCar => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const car = value as Record<string, unknown>;
  return typeof car.make === "string" && typeof car.model === "string";
};

export const loadFavorites = async (): Promise<FavoriteCar[]> => {
  try {
    const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!storedFavorites) {
      return [];
    }

    const parsedFavorites = JSON.parse(storedFavorites);
    return Array.isArray(parsedFavorites)
      ? parsedFavorites.filter(isFavoriteCar)
      : [];
  } catch {
    return [];
  }
};

export const saveFavorites = async (
  favorites: FavoriteCar[]
): Promise<void> => {
  await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
};
