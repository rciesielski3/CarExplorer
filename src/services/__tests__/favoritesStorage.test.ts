import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  FAVORITES_STORAGE_KEY,
  loadFavorites,
  saveFavorites,
} from "../favoritesStorage";

jest.mock(
  "@react-native-async-storage/async-storage",
  () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

describe("favoritesStorage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("saves and loads favorite cars", async () => {
    const favorites = [
      { make: "BMW", model: "M3" },
      { make: "Toyota", model: "Supra" },
    ];

    await saveFavorites(favorites);

    await expect(loadFavorites()).resolves.toEqual(favorites);
    await expect(AsyncStorage.getItem(FAVORITES_STORAGE_KEY)).resolves.toBe(
      JSON.stringify(favorites)
    );
  });

  it("returns an empty list when stored favorites are missing", async () => {
    await expect(loadFavorites()).resolves.toEqual([]);
  });

  it("returns an empty list when stored favorites are invalid", async () => {
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, "{broken-json");

    await expect(loadFavorites()).resolves.toEqual([]);
  });

  it("handles save failures without throwing", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    jest.spyOn(AsyncStorage, "setItem").mockRejectedValueOnce(new Error("full"));

    await expect(
      saveFavorites([{ make: "BMW", model: "M3" }])
    ).resolves.toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to save favorites to storage:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
