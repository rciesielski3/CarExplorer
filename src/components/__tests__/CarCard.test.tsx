import React from "react";
import TestRenderer, { act } from "react-test-renderer";

import CarCard from "../CarCard";
import { CompareProvider } from "../../context/CompareContext";
import { FavoritesProvider } from "../../context/FavoritesContext";
import { LanguageProvider } from "../../context/LanguageContext";
import { ThemeProvider } from "../../context/ThemeContext";
import { getCarDetails, getCarImageUrl } from "../../api/wikipediaApi";

jest.mock("../../api/wikipediaApi", () => ({
  getCarDetails: jest.fn(),
  getCarImageUrl: jest.fn(),
}));

jest.mock(
  "@react-native-async-storage/async-storage",
  () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("@expo/vector-icons", () => ({
  FontAwesome: () => null,
}));

jest.mock("../LoadingIndicator", () => {
  const { Text } = require("react-native");
  const MockLoadingIndicator = () => <Text>loading</Text>;

  return MockLoadingIndicator;
});

const mockedGetCarDetails = getCarDetails as jest.MockedFunction<
  typeof getCarDetails
>;
const mockedGetCarImageUrl = getCarImageUrl as jest.MockedFunction<
  typeof getCarImageUrl
>;

const renderCarCard = async () => {
  let renderer: TestRenderer.ReactTestRenderer;

  await act(async () => {
    renderer = TestRenderer.create(
      <ThemeProvider>
        <LanguageProvider>
          <FavoritesProvider>
            <CompareProvider>
              <CarCard make="Toyota" model="Supra" showCompare />
            </CompareProvider>
          </FavoritesProvider>
        </LanguageProvider>
      </ThemeProvider>
    );
  });

  return renderer!;
};

describe("CarCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetCarImageUrl.mockResolvedValue(null);
    mockedGetCarDetails.mockResolvedValue("Toyota Supra details");
  });

  it("opens the details modal immediately when the card is pressed", async () => {
    const renderer = await renderCarCard();
    const [cardPressable] = renderer.root.findAllByProps({
      testID: "car-card-pressable",
    });

    await act(async () => {
      cardPressable.props.onPress();
    });

    const [modal] = renderer.root.findAllByProps({
      testID: "car-details-modal",
    });

    expect(modal.props.visible).toBe(true);
    expect(mockedGetCarDetails).toHaveBeenCalledWith("Toyota", "Supra", "en");
  });

  it("toggles favorite without opening the details modal", async () => {
    const renderer = await renderCarCard();
    const [favoritePressable] = renderer.root.findAllByProps({
      testID: "car-favorite-pressable",
    });

    await act(async () => {
      favoritePressable.props.onPress({ stopPropagation: jest.fn() });
    });

    const [modal] = renderer.root.findAllByProps({
      testID: "car-details-modal",
    });

    expect(modal.props.visible).toBe(false);
    expect(mockedGetCarDetails).not.toHaveBeenCalled();
  });

  it("toggles compare without opening the details modal", async () => {
    const renderer = await renderCarCard();
    const [comparePressable] = renderer.root.findAllByProps({
      testID: "car-compare-pressable",
    });

    await act(async () => {
      comparePressable.props.onPress({ stopPropagation: jest.fn() });
    });

    const [modal] = renderer.root.findAllByProps({
      testID: "car-details-modal",
    });

    expect(modal.props.visible).toBe(false);
    expect(mockedGetCarDetails).not.toHaveBeenCalled();
  });
});
