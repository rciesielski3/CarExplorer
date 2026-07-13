import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useParallelImageFetch } from "../useParallelImageFetch";
import * as wikipediaApi from "../../api/wikipediaApi";
import * as carImagesApi from "../../api/carImagesApi";

jest.mock("../../api/wikipediaApi");
jest.mock("../../api/carImagesApi");

const mockFetchWikipediaCarImage = wikipediaApi.fetchWikipediaCarImage as jest.MockedFunction<typeof wikipediaApi.fetchWikipediaCarImage>;
const mockGetCarImagesFallbackUrl = carImagesApi.getCarImagesFallbackUrl as jest.MockedFunction<typeof carImagesApi.getCarImagesFallbackUrl>;
const mockGetGenericCarImageFallback = carImagesApi.getGenericCarImageFallback as jest.MockedFunction<typeof carImagesApi.getGenericCarImageFallback>;

describe("useParallelImageFetch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns loading state initially", () => {
    mockFetchWikipediaCarImage.mockImplementation(
      () => new Promise(() => {}) // never resolves
    );
    mockGetCarImagesFallbackUrl.mockImplementation(
      () => new Promise(() => {}) // never resolves
    );

    const { result } = renderHook(() =>
      useParallelImageFetch({ make: "Toyota", model: "Camry" })
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.imageUri).toBeNull();
  });

  it("displays Wikipedia image when it responds faster", async () => {
    mockFetchWikipediaCarImage.mockResolvedValueOnce(
      "https://wiki-image.jpg"
    );
    mockGetCarImagesFallbackUrl.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve("https://carimages.jpg"), 1000))
    );

    const { result } = renderHook(() =>
      useParallelImageFetch({ make: "Toyota", model: "Camry" })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.imageUri).toBe("https://wiki-image.jpg");
    expect(result.current.sourceStep).toBe("wiki");
  });

  it("displays CarImages when Wikipedia is slow", async () => {
    mockFetchWikipediaCarImage.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve("https://wiki-image.jpg"), 1000))
    );
    mockGetCarImagesFallbackUrl.mockResolvedValueOnce(
      "https://carimages.jpg"
    );

    const { result } = renderHook(() =>
      useParallelImageFetch({ make: "Toyota", model: "Camry" })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.imageUri).toBe("https://carimages.jpg");
    expect(result.current.sourceStep).toBe("carimages");
  });

  it("falls back to generic image when both APIs fail", async () => {
    mockFetchWikipediaCarImage.mockRejectedValueOnce(
      new Error("Network error")
    );
    mockGetCarImagesFallbackUrl.mockRejectedValueOnce(
      new Error("API error")
    );
    mockGetGenericCarImageFallback.mockResolvedValueOnce(
      "https://placehold.co/300x200"
    );

    const { result } = renderHook(() =>
      useParallelImageFetch({ make: "Toyota", model: "Camry" })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.imageUri).toBe("https://placehold.co/300x200");
    expect(result.current.sourceStep).toBe("generic");
  });

  it("handles null responses from both APIs", async () => {
    mockFetchWikipediaCarImage.mockResolvedValueOnce(null);
    mockGetCarImagesFallbackUrl.mockResolvedValueOnce(null);
    mockGetGenericCarImageFallback.mockResolvedValueOnce(
      "https://placehold.co/300x200"
    );

    const { result } = renderHook(() =>
      useParallelImageFetch({ make: "Toyota", model: "Camry" })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.imageUri).toBe("https://placehold.co/300x200");
    expect(result.current.sourceStep).toBe("generic");
  });

  it("re-fetches on refresh()", async () => {
    mockFetchWikipediaCarImage.mockResolvedValueOnce("https://wiki-image-1.jpg");
    mockGetCarImagesFallbackUrl.mockResolvedValueOnce(null);

    const { result } = renderHook(() =>
      useParallelImageFetch({ make: "Toyota", model: "Camry" })
    );

    await waitFor(() => expect(result.current.imageUri).toBe("https://wiki-image-1.jpg"));

    // Reset mocks for refresh
    jest.clearAllMocks();
    mockFetchWikipediaCarImage.mockResolvedValueOnce("https://wiki-image-2.jpg");
    mockGetCarImagesFallbackUrl.mockResolvedValueOnce(null);

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => expect(result.current.imageUri).toBe("https://wiki-image-2.jpg"));

    expect(mockFetchWikipediaCarImage).toHaveBeenCalledTimes(1);
    expect(mockGetCarImagesFallbackUrl).toHaveBeenCalledTimes(1);
  });

  it("updates when make/model/year props change", async () => {
    mockFetchWikipediaCarImage.mockResolvedValueOnce("https://toyota-image.jpg");
    mockGetCarImagesFallbackUrl.mockResolvedValueOnce(null);

    const { result, rerender } = renderHook(
      (props) => useParallelImageFetch(props),
      { initialProps: { make: "Toyota", model: "Camry" } }
    );

    await waitFor(() => expect(result.current.imageUri).toBe("https://toyota-image.jpg"));

    jest.clearAllMocks();
    mockFetchWikipediaCarImage.mockResolvedValueOnce("https://honda-image.jpg");
    mockGetCarImagesFallbackUrl.mockResolvedValueOnce(null);

    rerender({ make: "Honda", model: "Civic" });

    await waitFor(() => expect(result.current.imageUri).toBe("https://honda-image.jpg"));

    expect(mockFetchWikipediaCarImage).toHaveBeenCalledWith("Honda", "Civic");
  });

  it("handles Wikipedia returning null but CarImages succeeding", async () => {
    mockFetchWikipediaCarImage.mockResolvedValueOnce(null);
    mockGetCarImagesFallbackUrl.mockResolvedValueOnce("https://carimages.jpg");

    const { result } = renderHook(() =>
      useParallelImageFetch({ make: "Toyota", model: "Camry" })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.imageUri).toBe("https://carimages.jpg");
    expect(result.current.sourceStep).toBe("carimages");
  });

  it("passes year parameter to CarImages API when provided", async () => {
    mockFetchWikipediaCarImage.mockResolvedValueOnce(null);
    mockGetCarImagesFallbackUrl.mockResolvedValueOnce("https://carimages.jpg");

    renderHook(() =>
      useParallelImageFetch({ make: "Toyota", model: "Camry", year: "2023" })
    );

    await waitFor(() => {
      expect(mockGetCarImagesFallbackUrl).toHaveBeenCalledWith({
        make: "Toyota",
        model: "Camry",
        year: "2023",
      });
    });
  });
});
