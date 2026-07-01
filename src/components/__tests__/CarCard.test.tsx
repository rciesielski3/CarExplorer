import React from "react";
import { Image } from "react-native";
import TestRenderer, { act } from "react-test-renderer";

import CarCard from "../CarCard";
import { CompareProvider } from "../../context/CompareContext";
import { FavoritesProvider } from "../../context/FavoritesContext";
import { LanguageProvider } from "../../context/LanguageContext";
import { ThemeProvider } from "../../context/ThemeContext";
import { fetchWikipediaCarImage, getCarDetails, CarDetailsResult } from "../../api/wikipediaApi";
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
  const MockLoadingIndicator = () => (
    <Text testID="loading-indicator">loading</Text>
  );

  return MockLoadingIndicator;
});

const mockedGetCarDetails = getCarDetails as jest.MockedFunction<
  typeof getCarDetails
>;
const mockedFetchWikipediaCarImage =
  fetchWikipediaCarImage as jest.MockedFunction<typeof fetchWikipediaCarImage>;
const mockedGetCarImagesFallbackUrl =
  getCarImagesFallbackUrl as jest.MockedFunction<typeof getCarImagesFallbackUrl>;

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

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
};

describe("CarCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFetchWikipediaCarImage.mockResolvedValue(null);
    mockedGetCarImagesFallbackUrl.mockResolvedValue(null);
    mockedGetCarDetails.mockResolvedValue({ description: "Toyota Supra details" });
  });

  it("opens the details modal immediately and shows loading details", async () => {
    const details = createDeferred<CarDetailsResult | null>();
    mockedGetCarDetails.mockReturnValue(details.promise);
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
    expect(
      renderer.root.findAllByProps({ testID: "loading-indicator" }).length
    ).toBeGreaterThan(0);

    await act(async () => {
      details.resolve({ description: "Toyota Supra details" });
      await details.promise;
    });
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

  it("renders the Wikipedia image when the API returns an image URL", async () => {
    mockedFetchWikipediaCarImage.mockResolvedValue(
      "https://upload.wikimedia.org/toyota-supra.jpg"
    );

    const renderer = await renderCarCard();
    const image = findImageByUri(
      renderer,
      "https://upload.wikimedia.org/toyota-supra.jpg"
    );

    expect(image).toBeTruthy();
  });

  it("shows initials fallback after the image fails to load", async () => {
    mockedFetchWikipediaCarImage.mockResolvedValue(
      "https://upload.wikimedia.org/toyota-supra.jpg"
    );

    const renderer = await renderCarCard();
    const image = findImageByUri(
      renderer,
      "https://upload.wikimedia.org/toyota-supra.jpg"
    );

    await act(async () => {
      image?.props.onError();
    });

    expect(renderer.root.findByProps({ children: "TO" })).toBeTruthy();
  });

  it("shows initials fallback when Wikipedia has no image without rendering a dead URL", async () => {
    const renderer = await renderCarCard();

    expect(renderer.root.findAllByType(Image)).toHaveLength(0);
    expect(renderer.root.findByProps({ children: "TO" })).toBeTruthy();
  });

  it("shows loaded details in the modal", async () => {
    const renderer = await renderCarCard();
    const [cardPressable] = renderer.root.findAllByProps({
      testID: "car-card-pressable",
    });

    await act(async () => {
      cardPressable.props.onPress();
    });

    expect(
      renderer.root.findByProps({ children: "Toyota Supra details" })
    ).toBeTruthy();
    expect(renderer.root.findAllByProps({ children: "noDetails" })).toHaveLength(
      0
    );
  });

  it("shows noDetails only after details finish without content", async () => {
    mockedGetCarDetails.mockResolvedValue(null);

    const renderer = await renderCarCard();
    const [cardPressable] = renderer.root.findAllByProps({
      testID: "car-card-pressable",
    });

    await act(async () => {
      cardPressable.props.onPress();
    });

    expect(renderer.root.findByProps({ children: "noDetails" })).toBeTruthy();
  });
});
