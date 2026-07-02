/**
 * Integration tests for Wikipedia API with Wikidata fallback
 * These tests demonstrate the complete flow when Wikipedia fails
 * and Wikidata provides a fallback
 */
import { getCarDetails } from "../wikipediaApi";
import { getCarDetailsFromWikidata } from "../wikidataApi";
import {
  wikipediaSummaryResponse,
  wikipediaDetailsResponse,
  wikidataSearchResponse,
  wikidataEntityResponse,
  errorScenarios,
} from "./mocks";

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
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Wikipedia search - no results
      .mockResolvedValueOnce(wikipediaSummaryResponse({ query: { search: [] } }))
      // Wikipedia make-level query - fails
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Now Wikidata search succeeds
      .mockResolvedValueOnce(
        wikidataSearchResponse([
          {
            id: "Q123456",
            label: "Some Car",
            description: "automobile",
          },
        ])
      )
      // Wikidata description fetch succeeds
      .mockResolvedValueOnce(
        wikidataEntityResponse("Q123456", {
          en: {
            value: "A popular compact car",
          },
        })
      )
      // Wikidata specs fetch (called in parallel with description) - no claims data
      .mockResolvedValueOnce(wikidataEntityResponse("Q123456"));

    const result = await getCarDetails("Honda", "Civic");

    expect(result).toEqual({ description: "A popular compact car" });
    // 4 Wikipedia attempts + 1 Wikidata search + 1 description + 1 specs = 7 calls
    expect(mockFetch).toHaveBeenCalledTimes(7);
  });

  it("uses Wikipedia result when available (Wikidata not called)", async () => {
    // Wikipedia returns a result immediately
    mockFetch.mockResolvedValueOnce(
      wikipediaDetailsResponse({
        extract: "The Honda Civic is a compact car.",
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
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      .mockResolvedValueOnce(wikipediaSummaryResponse({ query: { search: [] } }))
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Wikidata search fails
      .mockResolvedValueOnce(errorScenarios.notFound404({}));

    const result = await getCarDetails("UnknownBrand", "UnknownModel");

    expect(result).toBeNull();
  });

  it("caches Wikidata results to avoid repeated API calls", async () => {
    mockFetch
      // First request: Wikipedia fails, Wikidata succeeds
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      .mockResolvedValueOnce(wikipediaSummaryResponse({ query: { search: [] } }))
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      .mockResolvedValueOnce(
        wikidataSearchResponse([
          {
            id: "Q999999",
            label: "Test Car",
            description: "automobile",
          },
        ])
      )
      .mockResolvedValueOnce(
        wikidataEntityResponse("Q999999", {
          en: {
            value: "A test automobile",
          },
        })
      )
      // Wikidata specs fetch (called in parallel with description)
      .mockResolvedValueOnce(wikidataEntityResponse("Q999999"));

    const result1 = await getCarDetails("BMW", "X5");
    const result2 = await getCarDetails("BMW", "X5");

    expect(result1).toEqual({ description: "A test automobile" });
    expect(result2).toEqual({ description: "A test automobile" });
    // First call makes 7 API calls, second uses cache (0 more calls)
    expect(mockFetch).toHaveBeenCalledTimes(7);
  });
});
