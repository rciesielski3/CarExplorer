import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { FavoritesProvider, useFavorites } from "../FavoritesContext";
import { FAVORITES_STORAGE_KEY } from "../../services/favoritesStorage";

jest.mock(
  "@react-native-async-storage/async-storage",
  () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

describe("FavoritesContext", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("exposes hydration state while favorites are loaded from storage", async () => {
    await AsyncStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify([{ make: "BMW", model: "M3" }])
    );
    const snapshots: ReturnType<typeof useFavorites>[] = [];

    const Probe = () => {
      snapshots.push(useFavorites());
      return null;
    };

    await act(async () => {
      TestRenderer.create(
        <FavoritesProvider>
          <Probe />
        </FavoritesProvider>
      );
    });

    expect(snapshots[0].isHydrated).toBe(false);
    expect(snapshots.at(-1)?.isHydrated).toBe(true);
    expect(snapshots.at(-1)?.favorites).toEqual([{ make: "BMW", model: "M3" }]);
  });
});
