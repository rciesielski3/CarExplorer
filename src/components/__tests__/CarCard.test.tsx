import React from "react";
import { Image } from "react-native";
import TestRenderer, { act } from "react-test-renderer";

import CarCard from "../CarCard";
import { CompareProvider } from "../../context/CompareContext";
import { FavoritesProvider } from "../../context/FavoritesContext";
import { LanguageProvider } from "../../context/LanguageContext";
import { ThemeProvider } from "../../context/ThemeContext";
import { getCarDetails, CarDetailsResult } from "../../api/wikipediaApi";
import { useParallelImageFetch } from "../../hooks/useParallelImageFetch";

jest.mock("../../api/wikipediaApi", () => ({
  getCarDetails: jest.fn(),
}));

jest.mock("../../hooks/useParallelImageFetch");

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
const mockUseParallelImageFetch =
  useParallelImageFetch as jest.MockedFunction<typeof useParallelImageFetch>;

const GENERIC_IMAGE_URL = "https://via.placeholder.com/300x200?text=Car+Image";

const mockImageFetchResult = (
  overrides: Partial<ReturnType<typeof useParallelImageFetch>> = {}
) => ({
  imageUri: null,
  isLoading: false,
  sourceStep: "wiki" as const,
  error: null,
  refresh: jest.fn(),
  ...overrides,
});

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
    mockUseParallelImageFetch.mockReturnValue(
      mockImageFetchResult({ imageUri: GENERIC_IMAGE_URL, sourceStep: "generic" })
    );
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

  it("renders the Wikipedia image when the hook returns an image URL", async () => {
    mockUseParallelImageFetch.mockReturnValue(
      mockImageFetchResult({
        imageUri: "https://upload.wikimedia.org/toyota-supra.jpg",
        sourceStep: "wiki",
      })
    );

    const renderer = await renderCarCard();
    const image = findImageByUri(
      renderer,
      "https://upload.wikimedia.org/toyota-supra.jpg"
    );

    expect(image).toBeTruthy();
  });

  it("shows loading indicator while fetching", async () => {
    mockUseParallelImageFetch.mockReturnValue(
      mockImageFetchResult({ imageUri: null, isLoading: true })
    );

    const renderer = await renderCarCard();

    expect(
      renderer.root.findAllByProps({ testID: "loading-indicator" }).length
    ).toBeGreaterThan(0);
  });

  it("calls refresh when the image fails to load", async () => {
    const mockRefresh = jest.fn();
    mockUseParallelImageFetch.mockReturnValue(
      mockImageFetchResult({
        imageUri: "https://upload.wikimedia.org/toyota-supra.jpg",
        sourceStep: "wiki",
        refresh: mockRefresh,
      })
    );

    const renderer = await renderCarCard();
    const image = findImageByUri(
      renderer,
      "https://upload.wikimedia.org/toyota-supra.jpg"
    );

    await act(async () => {
      image?.props.onError();
    });

    expect(mockRefresh).toHaveBeenCalled();
  });

  it("does not call refresh when a fallback image fails to load", async () => {
    const mockRefresh = jest.fn();
    mockUseParallelImageFetch.mockReturnValue(
      mockImageFetchResult({
        imageUri: GENERIC_IMAGE_URL,
        sourceStep: "generic",
        refresh: mockRefresh,
      })
    );

    const renderer = await renderCarCard();
    const image = findImageByUri(renderer, GENERIC_IMAGE_URL);

    await act(async () => {
      image?.props.onError();
    });

    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("displays generic placeholder image when hook resolves to the generic fallback", async () => {
    mockUseParallelImageFetch.mockReturnValue(
      mockImageFetchResult({ imageUri: GENERIC_IMAGE_URL, sourceStep: "generic" })
    );

    const renderer = await renderCarCard();

    expect(renderer.root.findAllByType(Image)).toHaveLength(1);
    const genericImage = findImageByUri(renderer, GENERIC_IMAGE_URL);
    expect(genericImage).toBeTruthy();
  });

  it("displays fallback initials when no image is available", async () => {
    mockUseParallelImageFetch.mockReturnValue(
      mockImageFetchResult({ imageUri: null, sourceStep: "fallback" })
    );

    const renderer = await renderCarCard();

    expect(renderer.root.findAllByType(Image)).toHaveLength(0);
    expect(renderer.root.findByProps({ children: "TO" })).toBeTruthy();
  });

  it("calls refresh when the refresh button in the modal is pressed", async () => {
    const mockRefresh = jest.fn();
    mockUseParallelImageFetch.mockReturnValue(
      mockImageFetchResult({
        imageUri: "https://upload.wikimedia.org/toyota-supra.jpg",
        sourceStep: "wiki",
        refresh: mockRefresh,
      })
    );

    const renderer = await renderCarCard();
    const [cardPressable] = renderer.root.findAllByProps({
      testID: "car-card-pressable",
    });

    await act(async () => {
      cardPressable.props.onPress();
    });

    const [refreshButton] = renderer.root.findAllByProps({
      testID: "refresh-image-button",
    });

    await act(async () => {
      refreshButton.props.onPress();
    });

    expect(mockRefresh).toHaveBeenCalled();
  });

  it("does not render a refresh button when there is no image", async () => {
    mockUseParallelImageFetch.mockReturnValue(
      mockImageFetchResult({ imageUri: null, sourceStep: "fallback" })
    );

    const renderer = await renderCarCard();
    const [cardPressable] = renderer.root.findAllByProps({
      testID: "car-card-pressable",
    });

    await act(async () => {
      cardPressable.props.onPress();
    });

    expect(
      renderer.root.findAllByProps({ testID: "refresh-image-button" })
    ).toHaveLength(0);
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
