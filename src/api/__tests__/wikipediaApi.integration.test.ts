/**
 * Integration tests for Wikipedia API with Wikidata fallback
 * These tests demonstrate the complete flow when Wikipedia fails
 * and Wikidata provides a fallback
 */
import { getCarDetails, __clearCaches } from "../wikipediaApi";
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
    __clearCaches();
  });

  it("falls back to Wikidata when Wikipedia fails for a car", async () => {
    // Wikipedia returns no results for all attempts
    // The code tries 3 unique model candidates (duplicates removed) with both details extract and summary
    mockFetch
      // Candidate 1: "Honda Civic" - details extract
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Candidate 1: "Honda Civic" - summary
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Candidate 2: "Honda Civic automobile" - details extract
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Candidate 2: "Honda Civic automobile" - summary
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Candidate 3: "Honda Civic car" - details extract
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Candidate 3: "Honda Civic car" - summary
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Search title for "Honda Civic"
      .mockResolvedValueOnce(wikipediaSummaryResponse({ query: { search: [] } }))
      // Make candidates: "Honda" - details extract
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Make candidates: "Honda" - summary
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Make candidates: "Honda automobile" - details extract
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Make candidates: "Honda automobile" - summary
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Make candidates: "Honda car" - details extract
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Make candidates: "Honda car" - summary
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
      // Wikidata description fetch (called in parallel)
      .mockResolvedValueOnce(
        wikidataEntityResponse("Q123456", {
          en: {
            value: "A popular compact car",
          },
        })
      )
      // Wikidata specs fetch (called in parallel with description)
      .mockResolvedValueOnce(wikidataEntityResponse("Q123456"));

    const result = await getCarDetails("Honda", "Civic");

    expect(result).toEqual({ description: "A popular compact car" });
    // 3 candidates × 2 calls + 1 search + 3 make candidates × 2 + 1 wikidata search + 1 description + 1 specs = 16 calls
    expect(mockFetch).toHaveBeenCalledTimes(16);
  });

  it("uses Wikipedia result when available (Wikidata not called)", async () => {
    // Wikipedia returns a result on the first try
    mockFetch.mockResolvedValueOnce(
      wikipediaDetailsResponse({
        extract: "The Honda Civic is a compact car.",
      })
    );

    const result = await getCarDetails("Honda", "Civic");

    expect(result).toEqual({ description: "The Honda Civic is a compact car." });
    // 1 Wikipedia details extract call (first candidate succeeds)
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("handles Wikidata search errors gracefully", async () => {
    // Wikipedia fails completely - all candidates return 404
    mockFetch
      // Candidate 1: "UnknownBrand UnknownModel" - details extract
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Candidate 1: "UnknownBrand UnknownModel" - summary
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Candidate 2: "UnknownBrand UnknownModel automobile" - details extract
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Candidate 2: "UnknownBrand UnknownModel automobile" - summary
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Candidate 3: "UnknownBrand UnknownModel car" - details extract
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Candidate 3: "UnknownBrand UnknownModel car" - summary
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Search title for "UnknownBrand UnknownModel"
      .mockResolvedValueOnce(wikipediaSummaryResponse({ query: { search: [] } }))
      // Make candidates: "UnknownBrand" - details extract
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Make candidates: "UnknownBrand" - summary
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Make candidates: "UnknownBrand automobile" - details extract
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Make candidates: "UnknownBrand automobile" - summary
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Make candidates: "UnknownBrand car" - details extract
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Make candidates: "UnknownBrand car" - summary
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Wikidata search fails
      .mockResolvedValueOnce(errorScenarios.notFound404({}));

    const result = await getCarDetails("UnknownBrand", "UnknownModel");

    expect(result).toBeNull();
  });

  it("caches Wikidata results to avoid repeated API calls", async () => {
    mockFetch
      // First request: Wikipedia fails, Wikidata succeeds
      // Candidate 1: "BMW X5" - details extract
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Candidate 1: "BMW X5" - summary
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Candidate 2: "BMW X5 automobile" - details extract
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Candidate 2: "BMW X5 automobile" - summary
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Candidate 3: "BMW X5 car" - details extract
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Candidate 3: "BMW X5 car" - summary
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Search title for "BMW X5"
      .mockResolvedValueOnce(wikipediaSummaryResponse({ query: { search: [] } }))
      // Make candidates: "BMW" - details extract
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Make candidates: "BMW" - summary
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Make candidates: "BMW automobile" - details extract
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Make candidates: "BMW automobile" - summary
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Make candidates: "BMW car" - details extract
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Make candidates: "BMW car" - summary
      .mockResolvedValueOnce(errorScenarios.notFound404({}))
      // Wikidata search succeeds
      .mockResolvedValueOnce(
        wikidataSearchResponse([
          {
            id: "Q999999",
            label: "Test Car",
            description: "automobile",
          },
        ])
      )
      // Wikidata description fetch (called in parallel)
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
    // First call makes 16 API calls (3 candidates × 2 + search + 3 make × 2 + 3 wikidata), second uses cache (0 more calls)
    expect(mockFetch).toHaveBeenCalledTimes(16);
  });
});
