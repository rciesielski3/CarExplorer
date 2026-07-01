/**
 * Integration tests for Wikipedia API with Wikidata fallback
 * These tests demonstrate the complete flow when Wikipedia fails
 * and Wikidata provides a fallback
 */
import { getCarDetails } from "../wikipediaApi";
import { getCarDetailsFromWikidata } from "../wikidataApi";

const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

describe("Wikipedia API with Wikidata Fallback Integration", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("falls back to Wikidata when Wikipedia fails for a car", async () => {
    // Wikipedia returns no results for all attempts
    mockFetch
      // Wikipedia query candidates - all fail
      .mockResolvedValueOnce(
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({}),
        })
      )
      .mockResolvedValueOnce(
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({}),
        })
      )
      // Wikipedia search - no results
      .mockResolvedValueOnce(
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              query: {
                search: [],
              },
            }),
        })
      )
      // Wikipedia make-level query - fails
      .mockResolvedValueOnce(
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({}),
        })
      )
      // Now Wikidata search succeeds
      .mockResolvedValueOnce(
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              search: [
                {
                  id: "Q123456",
                  label: "Some Car",
                  description: "automobile",
                },
              ],
            }),
        })
      )
      // Wikidata description fetch succeeds
      .mockResolvedValueOnce(
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              entities: {
                Q123456: {
                  descriptions: {
                    en: {
                      value: "A popular compact car",
                    },
                  },
                },
              },
            }),
        })
      )
      // Wikidata specs fetch (called in parallel with description) - no claims data
      .mockResolvedValueOnce(
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              entities: {
                Q123456: {
                  claims: {},
                },
              },
            }),
        })
      );

    const result = await getCarDetails("Honda", "Civic");

    expect(result).toEqual({ description: "A popular compact car" });
    // 4 Wikipedia attempts + 1 Wikidata search + 1 description + 1 specs = 7 calls
    expect(mockFetch).toHaveBeenCalledTimes(7);
  });

  it("uses Wikipedia result when available (Wikidata not called)", async () => {
    // Wikipedia returns a result immediately
    mockFetch.mockResolvedValueOnce(
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            query: {
              pages: {
                "123": {
                  extract: "The Honda Civic is a compact car.",
                },
              },
            },
          }),
      })
    );

    const result = await getCarDetails("Honda", "Civic");

    expect(result).toEqual({ description: "The Honda Civic is a compact car." });
    // Only 1 Wikipedia call - Wikidata not invoked
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("handles Wikidata search errors gracefully", async () => {
    // Wikipedia fails completely
    mockFetch
      .mockResolvedValueOnce(
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({}),
        })
      )
      .mockResolvedValueOnce(
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({}),
        })
      )
      .mockResolvedValueOnce(
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              query: {
                search: [],
              },
            }),
        })
      )
      .mockResolvedValueOnce(
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({}),
        })
      )
      // Wikidata search fails
      .mockResolvedValueOnce(
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({}),
        })
      );

    const result = await getCarDetails("UnknownBrand", "UnknownModel");

    expect(result).toBeNull();
  });

  it("caches Wikidata results to avoid repeated API calls", async () => {
    mockFetch
      // First request: Wikipedia fails, Wikidata succeeds
      .mockResolvedValueOnce(
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({}),
        })
      )
      .mockResolvedValueOnce(
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({}),
        })
      )
      .mockResolvedValueOnce(
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              query: {
                search: [],
              },
            }),
        })
      )
      .mockResolvedValueOnce(
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({}),
        })
      )
      .mockResolvedValueOnce(
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              search: [
                {
                  id: "Q999999",
                  label: "Test Car",
                  description: "automobile",
                },
              ],
            }),
        })
      )
      .mockResolvedValueOnce(
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              entities: {
                Q999999: {
                  descriptions: {
                    en: {
                      value: "A test automobile",
                    },
                  },
                },
              },
            }),
        })
      )
      // Wikidata specs fetch (called in parallel with description)
      .mockResolvedValueOnce(
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              entities: {
                Q999999: {
                  claims: {},
                },
              },
            }),
        })
      );

    const result1 = await getCarDetails("BMW", "X5");
    const result2 = await getCarDetails("BMW", "X5");

    expect(result1).toEqual({ description: "A test automobile" });
    expect(result2).toEqual({ description: "A test automobile" });
    // First call makes 7 API calls, second uses cache (0 more calls)
    expect(mockFetch).toHaveBeenCalledTimes(7);
  });
});
