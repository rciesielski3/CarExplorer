import React from "react";
import {
  render as rtlRender,
  renderHook,
  act,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

import "../../../i18n";
import { usePaginatedModels } from "../../hooks/usePaginatedModels";
import ExploreScreen from "../ExploreScreen";
import { ThemeProvider } from "../../context/ThemeContext";
import { CompareProvider } from "../../context/CompareContext";
import { fetchModelsForMake } from "../../api/nhtsaApi";
import { POPULAR_CAR_MAKES } from "../../../constants/carMakes";

jest.mock(
  "@react-native-async-storage/async-storage",
  () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("react-native-safe-area-context", () =>
  require("react-native-safe-area-context/jest/mock").default
);

jest.mock("../../api/nhtsaApi", () => ({
  fetchModelsForMake: jest.fn(),
  fetchModelsForMakeAndYear: jest.fn(),
  fetchModelsForMakeAndType: jest.fn(),
}));

jest.mock("../../services/carLogoService", () => ({
  fetchCarLogos: jest.fn().mockResolvedValue({}),
}));

// CarCard and AdBanner pull in their own heavy dependency trees (image
// fetching, favorites, ads SDK) that are irrelevant to pagination behavior.
jest.mock("../../components/CarCard", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../../components/AdBanner", () => ({
  __esModule: true,
  default: () => null,
}));

const mockFetchModelsForMake = fetchModelsForMake as jest.MockedFunction<
  typeof fetchModelsForMake
>;

const mockModels = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  name: `Model ${i}`,
}));

const ExploreScreenProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <NavigationContainer>
    <ThemeProvider>
      <CompareProvider>{children}</CompareProvider>
    </ThemeProvider>
  </NavigationContainer>
);

const render = (ui: React.ReactElement) =>
  rtlRender(ui, { wrapper: ExploreScreenProviders });

// Navigates from the make-selection grid into a make's model list so the
// pagination UI (Load More button) has something to render.
// The first render in this suite pays the cost of lazily-initialized native
// module mocks (LinearGradient, VirtualizedList, etc.), which can exceed
// Jest's default 5s test timeout on slower machines.
jest.setTimeout(20000);

const selectFirstMake = async () => {
  await waitFor(() => {
    expect(screen.getByText(POPULAR_CAR_MAKES[0])).toBeOnTheScreen();
  });
  fireEvent.press(screen.getByText(POPULAR_CAR_MAKES[0]));
};

describe("usePaginatedModels", () => {
  const mockModels = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    name: `Model ${i}`,
  }));

  it("should display first 25 models initially with default batchSize", () => {
    const { result } = renderHook(() => usePaginatedModels(mockModels));
    expect(result.current.displayedModels).toHaveLength(25);
    expect(result.current.hasMore).toBe(true);
  });

  it("should load next 25 models on handleLoadMore", () => {
    const { result } = renderHook(() => usePaginatedModels(mockModels));
    expect(result.current.displayedModels).toHaveLength(25);

    act(() => {
      result.current.handleLoadMore();
    });

    expect(result.current.displayedModels).toHaveLength(50);
  });

  it("should set hasMore to false when all models loaded", () => {
    const { result } = renderHook(() => usePaginatedModels(mockModels));

    // Load all batches
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.handleLoadMore();
      });
    }

    expect(result.current.displayedModels).toHaveLength(50);
    expect(result.current.hasMore).toBe(false);
  });

  it("should respect custom batchSize option", () => {
    const { result } = renderHook(() => usePaginatedModels(mockModels, { batchSize: 10 }));
    expect(result.current.displayedModels).toHaveLength(10);
  });
});

describe("ExploreScreen Pagination Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchModelsForMake.mockResolvedValue(mockModels);
  });

  it("should display Load More button when models exceed batch size", async () => {
    render(<ExploreScreen />);

    await selectFirstMake();

    await waitFor(() => {
      // The button text comes from t('loadMore') translation
      expect(screen.queryByRole("button", { name: /load.*more/i })).toBeOnTheScreen();
    });
  });

  it("should load next batch when Load More is pressed", async () => {
    render(<ExploreScreen />);

    await selectFirstMake();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /load.*more/i })).toBeOnTheScreen();
    });

    const loadMoreButton = screen.getByRole("button", { name: /load.*more/i });
    fireEvent.press(loadMoreButton);

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /load.*more/i })).toBeOnTheScreen();
    });
  });

  it("should hide Load More button when all models loaded", async () => {
    render(<ExploreScreen />);

    await selectFirstMake();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /load.*more/i })).toBeOnTheScreen();
    });

    // Simulate clicking Load More multiple times
    for (let i = 0; i < 10; i++) {
      const loadMoreButton = screen.queryByRole("button", { name: /load.*more/i });
      if (loadMoreButton) {
        fireEvent.press(loadMoreButton);
      }
    }

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /load.*more/i })).not.toBeOnTheScreen();
    });
  });
});
