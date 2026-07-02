import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { PremiumProvider, usePremium } from "../PremiumContext";

jest.mock(
  "@react-native-async-storage/async-storage",
  () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

describe("PremiumContext", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("usePremium hook works correctly", () => {
    let premium!: ReturnType<typeof usePremium>;

    const Probe = () => {
      premium = usePremium();
      return null;
    };

    act(() => {
      TestRenderer.create(
        <PremiumProvider>
          <Probe />
        </PremiumProvider>
      );
    });

    expect(premium).toBeDefined();
    expect(premium.isPremium).toBe(false);
    expect(typeof premium.setIsPremium).toBe("function");
    expect(premium.isHydrated).toBe(false);
  });

  it("isPremium state persists to AsyncStorage", async () => {
    let premium!: ReturnType<typeof usePremium>;

    const Probe = () => {
      premium = usePremium();
      return null;
    };

    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <PremiumProvider>
          <Probe />
        </PremiumProvider>
      );
    });

    await act(async () => {
      await premium.setIsPremium(true);
    });

    const stored = await AsyncStorage.getItem("isPremium");
    expect(stored).toBe("true");
  });

  it("setIsPremium updates state and saves", async () => {
    let premium!: ReturnType<typeof usePremium>;

    const Probe = () => {
      premium = usePremium();
      return null;
    };

    await act(async () => {
      TestRenderer.create(
        <PremiumProvider>
          <Probe />
        </PremiumProvider>
      );
    });

    expect(premium.isPremium).toBe(false);

    await act(async () => {
      await premium.setIsPremium(true);
    });

    expect(premium.isPremium).toBe(true);

    const stored = await AsyncStorage.getItem("isPremium");
    expect(stored).toBe("true");
  });

  it("error thrown when hook used outside provider", () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const Probe = () => {
      try {
        usePremium();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(
          "usePremium must be used within a PremiumProvider"
        );
      }
      return null;
    };

    TestRenderer.create(<Probe />);
    consoleErrorSpy.mockRestore();
  });

  it("hydration works on mount", async () => {
    await AsyncStorage.setItem("isPremium", JSON.stringify(true));
    const snapshots: ReturnType<typeof usePremium>[] = [];

    const Probe = () => {
      const premium = usePremium();
      snapshots.push({ ...premium });
      return null;
    };

    await act(async () => {
      const renderer = TestRenderer.create(
        <PremiumProvider>
          <Probe />
        </PremiumProvider>
      );
    });

    // Wait a bit for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // First snapshot should be hydrating
    expect(snapshots[0].isHydrated).toBe(false);

    // Last snapshot should be hydrated with the correct value
    expect(snapshots.at(-1)?.isHydrated).toBe(true);
    expect(snapshots.at(-1)?.isPremium).toBe(true);
  });
});
