import React from "react";
import { Image } from "react-native";
import TestRenderer, { act } from "react-test-renderer";

import CarCard from "../CarCard";
import { CompareProvider } from "../../context/CompareContext";
import { FavoritesProvider } from "../../context/FavoritesContext";
import { LanguageProvider } from "../../context/LanguageContext";
import { ThemeProvider } from "../../context/ThemeContext";
import { fetchWikipediaCarImage, getCarDetails } from "../../api/wikipediaApi";
import { getCarImagesFallbackUrl } from "../../api/carImagesApi";

jest.mock("../../api/wikipediaApi", () => ({
  getCarDetails: jest.fn(),
  fetchWikipediaCarImage: jest.fn(),
}));

jest.mock("../../api/carImagesApi", () => ({
  getCarImagesFallbackUrl: jest.fn(),
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
const mockedFetchWikipediaCarImage =
  fetchWikipediaCarImage as jest.MockedFunction<typeof fetchWikipediaCarImage>;
const mockedGetCarImagesFallbackUrl = getCarImagesFallbackUrl as jest.MockedFunction<
  typeof getCarImagesFallbackUrl
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

const findImageByUri = (renderer: TestRenderer.ReactTestRenderer, uri: string) =>
  renderer.root
    .findAllByType(Image)
    .find((image) => image.props.source?.uri === uri);

describe("CarCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFetchWikipediaCarImage.mockResolvedValue(null);
    mockedGetCarImagesFallbackUrl.mockReturnValue(
      "https://carimagesapi.com/image?make=Toyota&model=Supra"
    );
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

  it("uses CarImages fallback when Wikipedia has no image", async () => {
    const renderer = await renderCarCard();
    const image = findImageByUri(
      renderer,
      "https://carimagesapi.com/image?make=Toyota&model=Supra"
    );

    expect(image).toBeTruthy();
    expect(mockedGetCarImagesFallbackUrl).toHaveBeenCalledWith({
      make: "Toyota",
      model: "Supra",
      year: undefined,
    });
  });

  it("shows initials fallback after image fallback fails", async () => {
    const renderer = await renderCarCard();
    const image = findImageByUri(
      renderer,
      "https://carimagesapi.com/image?make=Toyota&model=Supra"
    );

    await act(async () => {
      image?.props.onError();
    });

    expect(renderer.root.findByProps({ children: "TO" })).toBeTruthy();
  });
});
