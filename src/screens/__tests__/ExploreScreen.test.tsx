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

  it("should display first 12 models initially", () => {
    const { result } = renderHook(() => usePaginatedModels(mockModels));
    expect(result.current.displayedModels).toHaveLength(12);
    expect(result.current.totalCount).toBe(50);
  });

  it("should load next 12 models on handleLoadMore", () => {
    const { result } = renderHook(() => usePaginatedModels(mockModels));
    expect(result.current.displayedModels).toHaveLength(12);

    act(() => {
      result.current.handleLoadMore();
    });

    expect(result.current.displayedModels).toHaveLength(24);
  });

  it("should not exceed total models count", () => {
    const { result } = renderHook(() => usePaginatedModels(mockModels));

    // Load all batches
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.handleLoadMore();
      });
    }

    expect(result.current.displayedModels).toHaveLength(50);
  });

  it("should return true for isPreloading when next batch is being preloaded", () => {
    const { result } = renderHook(() => usePaginatedModels(mockModels));

    expect(result.current.isPreloading).toBe(false);

    act(() => {
      result.current.triggerPreload();
    });

    expect(result.current.isPreloading).toBe(true);
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
      expect(screen.queryByText("Load More Models")).toBeOnTheScreen();
    });
  });

  it("should load next batch when Load More is pressed", async () => {
    render(<ExploreScreen />);

    await selectFirstMake();

    await waitFor(() => {
      expect(screen.getByText("Load More Models")).toBeOnTheScreen();
    });

    const loadMoreButton = screen.getByText("Load More Models");
    fireEvent.press(loadMoreButton);

    await waitFor(() => {
      expect(screen.queryByText("Load More Models")).toBeOnTheScreen();
    });
  });

  it("should hide Load More button when all models loaded", async () => {
    render(<ExploreScreen />);

    await selectFirstMake();

    await waitFor(() => {
      expect(screen.getByText("Load More Models")).toBeOnTheScreen();
    });

    // Simulate clicking Load More multiple times
    for (let i = 0; i < 10; i++) {
      if (screen.queryByText("Load More Models")) {
        fireEvent.press(screen.getByText("Load More Models"));
      }
    }

    await waitFor(() => {
      expect(screen.queryByText("Load More Models")).not.toBeOnTheScreen();
    });
  });
});
