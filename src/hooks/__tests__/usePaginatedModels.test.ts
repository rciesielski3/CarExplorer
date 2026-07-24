import { renderHook, act } from "@testing-library/react-native";
import { usePaginatedModels } from "../usePaginatedModels";

interface CarModel {
  id: number;
  name: string;
}

const makeModels = (count: number): CarModel[] =>
  Array.from({ length: count }, (_, i) => ({ id: i + 1, name: `Model ${i + 1}` }));

describe("usePaginatedModels", () => {
  it("loads the first batch (25) initially", () => {
    const { result } = renderHook(() => usePaginatedModels(makeModels(50)));

    expect(result.current.displayedModels).toHaveLength(25);
    expect(result.current.loadedCount).toBe(25);
    expect(result.current.totalCount).toBe(50);
    expect(result.current.hasMore).toBe(true);
  });

  it("loads more models on handleLoadMore", () => {
    const models = makeModels(50);
    const { result } = renderHook(() => usePaginatedModels(models));

    act(() => {
      result.current.handleLoadMore();
    });

    expect(result.current.displayedModels).toHaveLength(50);
    expect(result.current.loadedCount).toBe(50);
    expect(result.current.hasMore).toBe(false);
  });

  it("resets pagination to first batch when allModels changes (new make/filter)", () => {
    const { result, rerender } = renderHook(
      (props: { models: CarModel[] }) => usePaginatedModels(props.models),
      { initialProps: { models: makeModels(50) } }
    );

    act(() => {
      result.current.handleLoadMore();
    });
    expect(result.current.loadedCount).toBe(50);

    rerender({ models: makeModels(40) });

    expect(result.current.loadedCount).toBe(25);
    expect(result.current.displayedModels).toHaveLength(25);
    expect(result.current.totalCount).toBe(40);
    expect(result.current.hasMore).toBe(true);
  });

  it("respects a custom batchSize when resetting", () => {
    const { result, rerender } = renderHook(
      (props: { models: CarModel[] }) =>
        usePaginatedModels(props.models, { batchSize: 10 }),
      { initialProps: { models: makeModels(30) } }
    );

    act(() => {
      result.current.handleLoadMore();
    });
    expect(result.current.loadedCount).toBe(20);

    rerender({ models: makeModels(15) });

    expect(result.current.loadedCount).toBe(10);
  });
});
