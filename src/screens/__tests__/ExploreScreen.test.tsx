import { renderHook, act } from "@testing-library/react-native";

import { usePaginatedModels } from "../../hooks/usePaginatedModels";

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
