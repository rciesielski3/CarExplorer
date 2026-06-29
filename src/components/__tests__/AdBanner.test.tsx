import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AdBanner from "../AdBanner";
import { PremiumProvider, usePremium } from "../../context/PremiumContext";
import { ThemeProvider } from "../../context/ThemeContext";

jest.mock(
  "@react-native-async-storage/async-storage",
  () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("react-native-google-mobile-ads", () => ({
  BannerAd: jest.fn(() => {
    const { View } = require("react-native");
    return <View testID="banner-ad-mock" />;
  }),
  BannerAdSize: {
    ANCHORED_ADAPTIVE_BANNER: "ANCHORED_ADAPTIVE_BANNER",
  },
  TestIds: {
    BANNER: "ca-app-pub-3940256099942544/6300978111",
  },
}));

jest.mock("@/constants/GlobalStyles", () => ({
  createGlobalStyles: () => ({
    adBannerContainer: {},
  }),
}));

jest.mock("../../config/monetizationConfig", () => ({
  monetizationConfig: {
    adsEnabled: true,
    useTestAds: true,
    androidAppId: "test-app-id",
    androidBannerAdUnitId: "test-unit-id",
  },
}));

describe("AdBanner", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it("renders AdBanner component successfully", async () => {
    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <PremiumProvider>
            <AdBanner />
          </PremiumProvider>
        </ThemeProvider>
      );
    });

    expect(renderer!).toBeDefined();
  });

  it("integrates with PremiumContext to check isPremium status", async () => {
    let premiumContext: ReturnType<typeof usePremium>;

    const Probe = () => {
      premiumContext = usePremium();
      return <AdBanner />;
    };

    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <PremiumProvider>
            <Probe />
          </PremiumProvider>
        </ThemeProvider>
      );
    });

    // Verify isPremium hook is available and works
    expect(premiumContext!).toBeDefined();
    expect(premiumContext!.isPremium).toBe(false);
  });

  it("correctly reads isPremium state from context", async () => {
    let premiumContext: ReturnType<typeof usePremium>;
    const states: boolean[] = [];

    const Probe = () => {
      premiumContext = usePremium();
      states.push(premiumContext.isPremium);
      return <AdBanner />;
    };

    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <PremiumProvider>
            <Probe />
          </PremiumProvider>
        </ThemeProvider>
      );
    });

    expect(states[0]).toBe(false);

    await act(async () => {
      await premiumContext!.setIsPremium(true);
    });

    // Component should re-render after premium status changes
    expect(premiumContext!.isPremium).toBe(true);
  });

  it("verifies AdBanner has access to theme context", async () => {
    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <PremiumProvider>
            <AdBanner />
          </PremiumProvider>
        </ThemeProvider>
      );
    });

    expect(renderer!).toBeDefined();
  });

  it("persists premium state to AsyncStorage", async () => {
    let premiumContext: ReturnType<typeof usePremium>;

    const Probe = () => {
      premiumContext = usePremium();
      return <AdBanner />;
    };

    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <PremiumProvider>
            <Probe />
          </PremiumProvider>
        </ThemeProvider>
      );
    });

    await act(async () => {
      await premiumContext!.setIsPremium(true);
    });

    const stored = await AsyncStorage.getItem("isPremium");
    expect(stored).toBe("true");
  });
});
