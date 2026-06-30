import React from "react";
import { Switch, TouchableOpacity, Text } from "react-native";
import TestRenderer, { act } from "react-test-renderer";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SettingsScreen from "../SettingsScreen";
import { PremiumProvider, usePremium } from "../../context/PremiumContext";
import { ThemeProvider } from "../../context/ThemeContext";
import { LanguageProvider } from "../../context/LanguageContext";
import { FavoritesProvider, useFavorites } from "../../context/FavoritesContext";
import { CompareProvider, useCompare } from "../../context/CompareContext";
import { FAVORITES_STORAGE_KEY } from "../../services/favoritesStorage";

jest.mock(
  "@react-native-async-storage/async-storage",
  () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("../../components/ReusableModalSelector", () => {
  const { View } = require("react-native");
  return () => <View testID="language-selector" />;
});

jest.mock("../../components", () => ({
  AboutModal: ({ visible }: { visible: boolean }) => {
    const { View } = require("react-native");
    return visible ? <View testID="about-modal" /> : null;
  },
  ConfirmModal: ({
    visible,
    onConfirm,
    onCancel,
  }: {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }) => {
    const { View, TouchableOpacity, Text } = require("react-native");
    return visible ? (
      <View testID="confirm-modal">
        <TouchableOpacity
          testID="confirm-modal-confirm"
          onPress={onConfirm}
        >
          <Text>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="confirm-modal-cancel" onPress={onCancel}>
          <Text>Cancel</Text>
        </TouchableOpacity>
      </View>
    ) : null;
  },
  ScreenContainer: ({ children }: { children: React.ReactNode }) => {
    const { View } = require("react-native");
    return <View testID="screen-container">{children}</View>;
  },
}));

jest.mock("@/constants/GlobalStyles", () => ({
  createGlobalStyles: () => ({
    title: {},
    settingRow: {},
    settingLabel: {},
    adBannerContainer: {},
    emptyText: {},
  }),
  createHomeScreenStyles: () => ({
    container: {},
  }),
}));

jest.mock("@/constants/Colors", () => ({
  Colors: {
    light: {
      icon: "#000",
    },
    dark: {
      icon: "#fff",
    },
  },
}));

const renderSettingsScreen = async () => {
  let renderer: TestRenderer.ReactTestRenderer;

  await act(async () => {
    renderer = TestRenderer.create(
      <ThemeProvider>
        <LanguageProvider>
          <PremiumProvider>
            <FavoritesProvider>
              <CompareProvider>
                <SettingsScreen />
              </CompareProvider>
            </FavoritesProvider>
          </PremiumProvider>
        </LanguageProvider>
      </ThemeProvider>
    );
  });

  return renderer!;
};

describe("SettingsScreen", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it("premium toggle appears in settings", async () => {
    const renderer = await renderSettingsScreen();
    const switches = renderer.root.findAllByType(Switch);

    // Should have at least 2 switches: dark mode and premium toggle
    expect(switches.length).toBeGreaterThanOrEqual(2);
  });

  it("premium toggle reflects isPremium state", async () => {
    const { usePremium } = require("../../context/PremiumContext");
    let premiumContext: ReturnType<typeof usePremium>;

    const Probe = () => {
      premiumContext = usePremium();
      return <SettingsScreen />;
    };

    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <LanguageProvider>
            <PremiumProvider>
              <FavoritesProvider>
                <CompareProvider>
                  <Probe />
                </CompareProvider>
              </FavoritesProvider>
            </PremiumProvider>
          </LanguageProvider>
        </ThemeProvider>
      );
    });

    const switches = renderer.root.findAllByType(Switch);
    const premiumSwitch = switches.find(
      (sw) => sw.props.accessible === true
    );

    expect(premiumSwitch?.props.value).toBe(false);

    await act(async () => {
      await premiumContext.setIsPremium(true);
    });

    const updatedSwitches = renderer.root.findAllByType(Switch);
    const updatedPremiumSwitch = updatedSwitches.find(
      (sw) => sw.props.accessible === true
    );

    expect(updatedPremiumSwitch?.props.value).toBe(true);
  });

  it("toggling premium calls setIsPremium", async () => {
    const { usePremium } = require("../../context/PremiumContext");
    let premiumContext: ReturnType<typeof usePremium>;

    const Probe = () => {
      premiumContext = usePremium();
      return <SettingsScreen />;
    };

    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <LanguageProvider>
            <PremiumProvider>
              <FavoritesProvider>
                <CompareProvider>
                  <Probe />
                </CompareProvider>
              </FavoritesProvider>
            </PremiumProvider>
          </LanguageProvider>
        </ThemeProvider>
      );
    });

    const switches = renderer.root.findAllByType(Switch);
    const premiumSwitch = switches.find(
      (sw) => sw.props.accessible === true
    );

    expect(premiumSwitch).toBeDefined();

    await act(async () => {
      premiumSwitch?.props.onValueChange(true);
    });

    expect(premiumContext.isPremium).toBe(true);
  });

  it("clear favorites button appears", async () => {
    const renderer = await renderSettingsScreen();
    const buttons = renderer.root.findAllByType(TouchableOpacity);

    // Should have multiple buttons: reset data, clear favorites, about
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  it("clear favorites modal shows confirmation", async () => {
    const renderer = await renderSettingsScreen();
    const buttons = renderer.root.findAllByType(TouchableOpacity);

    // Find the clear favorites button (second button after reset data)
    const clearFavoritesButton = buttons[1];

    await act(async () => {
      clearFavoritesButton.props.onPress();
    });

    const modals = renderer.root.findAllByProps({ testID: "confirm-modal" });
    expect(modals.length).toBeGreaterThan(0);
  });

  it("confirm clears favorites and shows success message", async () => {
    const { useFavorites } = require("../../context/FavoritesContext");
    let favoritesContext: ReturnType<typeof useFavorites>;

    // Set up some favorites first
    await AsyncStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify([{ make: "BMW", model: "M3" }])
    );

    const Probe = () => {
      favoritesContext = useFavorites();
      return <SettingsScreen />;
    };

    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <LanguageProvider>
            <PremiumProvider>
              <FavoritesProvider>
                <CompareProvider>
                  <Probe />
                </CompareProvider>
              </FavoritesProvider>
            </PremiumProvider>
          </LanguageProvider>
        </ThemeProvider>
      );
    });

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const clearFavoritesButton = buttons[1];

    // Open the modal
    await act(async () => {
      clearFavoritesButton.props.onPress();
    });

    const confirmButton = renderer.root.findByProps({
      testID: "confirm-modal-confirm",
    });

    // Confirm the action
    await act(async () => {
      confirmButton.props.onPress();
    });

    // Check that success message appears
    const successTexts = renderer.root.findAllByType(Text).filter(
      (text) =>
        text.props.children &&
        text.props.children.includes("cleared")
    );

    expect(successTexts.length).toBeGreaterThan(0);

    // Verify favorites were cleared
    expect(favoritesContext.favorites).toEqual([]);
  });

  it("success message disappears after timeout", async () => {
    const { useFavorites } = require("../../context/FavoritesContext");

    const Probe = () => {
      useFavorites();
      return <SettingsScreen />;
    };

    let renderer: TestRenderer.ReactTestRenderer;

    jest.useFakeTimers();

    await act(async () => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <LanguageProvider>
            <PremiumProvider>
              <FavoritesProvider>
                <CompareProvider>
                  <Probe />
                </CompareProvider>
              </FavoritesProvider>
            </PremiumProvider>
          </LanguageProvider>
        </ThemeProvider>
      );
    });

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const clearFavoritesButton = buttons[1];

    // Open the modal
    await act(async () => {
      clearFavoritesButton.props.onPress();
    });

    const confirmButton = renderer.root.findByProps({
      testID: "confirm-modal-confirm",
    });

    // Confirm the action
    await act(async () => {
      confirmButton.props.onPress();
    });

    // Check that success message appears
    let successTexts = renderer.root
      .findAllByType(Text)
      .filter(
        (text) =>
          text.props.children &&
          text.props.children.includes("cleared")
      );
    expect(successTexts.length).toBeGreaterThan(0);

    // Fast-forward time by 3001ms
    await act(async () => {
      jest.advanceTimersByTime(3001);
    });

    // Success message should be gone
    successTexts = renderer.root
      .findAllByType(Text)
      .filter(
        (text) =>
          text.props.children &&
          text.props.children.includes("cleared")
      );
    expect(successTexts.length).toBe(0);

    jest.useRealTimers();
  });
});
