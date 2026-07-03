import { fetchWikipediaCarImage, getCarDetails, __clearCaches } from "../wikipediaApi";
import {
  mockResponse,
  wikipediaSummaryResponse,
  wikipediaDetailsResponse,
  errorScenarios,
} from "./mocks";

const mockFetch = jest.fn();

global.fetch = mockFetch as jest.Mock;

const wikipediaNoPagesResponse = () =>
  Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({ query: {} }),
  });

const wikipediaSearchResponse = (title?: string) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        query: {
          search: title ? [{ title }] : [],
        },
      }),
  });

describe("wikipediaApi", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    __clearCaches();
  });

  it("falls back through Wikipedia REST image candidates", async () => {
    mockFetch
      .mockResolvedValueOnce(wikipediaSummaryResponse({}, false))
      .mockResolvedValueOnce(wikipediaSummaryResponse({}, false))
      .mockResolvedValueOnce(
        wikipediaSummaryResponse({
          thumbnail: { source: "https://example.com/toyota.jpg" },
        })
      );

    await expect(fetchWikipediaCarImage("Toyota", "Corolla")).resolves.toBe(
      "https://example.com/toyota.jpg"
    );
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("encodes image lookup queries before calling Wikipedia", async () => {
    mockFetch.mockResolvedValue(wikipediaSummaryResponse({}, false));

    await fetchWikipediaCarImage("Citroën", "C3");

    expect(mockFetch.mock.calls[0][0]).toContain("Citro%C3%ABn%20C3");
  });

  it("does not duplicate make when model already includes it", async () => {
    mockFetch.mockResolvedValue(wikipediaSummaryResponse({}, false));

    await fetchWikipediaCarImage("Ford", "Ford Crown Victoria");

    expect(mockFetch.mock.calls[0][0]).toContain("Ford%20Crown%20Victoria");
    expect(mockFetch.mock.calls[0][0]).not.toContain("Ford%20Ford");
  });

  it("handles makes with regexp special characters", async () => {
    mockFetch.mockResolvedValue(wikipediaSummaryResponse({}, false));

    await expect(
      fetchWikipediaCarImage("A+B", "A+B Roadster")
    ).resolves.toBeNull();
    expect(mockFetch.mock.calls[0][0]).toContain("A%2BB%20Roadster");
  });

  it("returns null when details response has no pages", async () => {
    mockFetch.mockResolvedValue(
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ query: {} }),
      })
    );

    await expect(getCarDetails("Unknown", "Model", "en")).resolves.toBeNull();
  });

  it("does not block REST details fallback when action API returns missing", async () => {
    mockFetch
      .mockResolvedValueOnce(wikipediaDetailsResponse({ missing: true }))
      .mockResolvedValueOnce(
        wikipediaSummaryResponse({
          extract: "The Renault Zoe is a battery electric car.",
        })
      );

    await expect(getCarDetails("Renault", "Zoe", "en")).resolves.toEqual({
      description: "The Renault Zoe is a battery electric car.",
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("uses Wikipedia search fallback when exact detail candidates are empty", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("list=search")) {
        return wikipediaSearchResponse("Mazda MX-5");
      }

      if (url.includes("titles=Mazda_MX-5")) {
        return wikipediaDetailsResponse({
          extract: "The Mazda MX-5 is a two-seat roadster.",
        });
      }

      if (url.includes("/page/summary/")) {
        return wikipediaSummaryResponse({}, false);
      }

      return wikipediaDetailsResponse({ extract: "" });
    });

    await expect(getCarDetails("Mazda", "Miata", "en")).resolves.toEqual({
      description: "The Mazda MX-5 is a two-seat roadster.",
    });
  });

  it("uses make-level details fallback after exact and search fallbacks fail", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("list=search")) {
        return wikipediaSearchResponse();
      }

      if (url.includes("titles=Saab&")) {
        return wikipediaDetailsResponse({
          extract: "Saab Automobile AB was a car manufacturer.",
        });
      }

      if (url.includes("/page/summary/")) {
        return wikipediaSummaryResponse({}, false);
      }

      return wikipediaDetailsResponse({ missing: true });
    });

    await expect(getCarDetails("Saab", "Imaginary 9000", "en")).resolves.toEqual({
      description: "Saab Automobile AB was a car manufacturer.",
    });
  });

  it("falls back to Wikipedia summary extract when query details are empty", async () => {
    mockFetch
      .mockResolvedValueOnce(wikipediaDetailsResponse({ extract: "" }))
      .mockResolvedValueOnce(
        wikipediaSummaryResponse({
          extract: "The Ford Crown Victoria is a full-size sedan.",
        })
      );

    await expect(getCarDetails("Ford", "Crown Victoria", "en")).resolves.toEqual({
      description: "The Ford Crown Victoria is a full-size sedan.",
    });
  });

  it("uses English details fallback when selected language has no details", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.startsWith("https://pl.wikipedia.org")) {
        if (url.includes("list=search")) {
          return wikipediaSearchResponse();
        }

        if (url.includes("/page/summary/")) {
          return wikipediaSummaryResponse({}, false);
        }

        return wikipediaDetailsResponse({ extract: "" });
      }

      if (url.includes("titles=Toyota_Corolla_automobile")) {
        return wikipediaDetailsResponse({
          extract: "The Toyota Corolla is a compact car.",
        });
      }

      if (url.includes("/page/summary/")) {
        return wikipediaSummaryResponse({}, false);
      }

      return wikipediaDetailsResponse({ extract: "" });
    });

    await expect(getCarDetails("Toyota", "Corolla", "pl")).resolves.toEqual({
      description: "The Toyota Corolla is a compact car.",
    });
  });

  it("uses pageimages from a searched title before make-level images", async () => {
    mockFetch.mockImplementation((url: string) => {
      // First two candidates return no image
      if (url.includes("Nissan%20EV") && !url.includes("automobile") && !url.includes("car")) {
        return wikipediaSummaryResponse({}, false);
      }

      // Second candidate (automobile) has the image
      if (url.includes("Nissan%20EV%20automobile")) {
        return mockResponse(
          {
            thumbnail: {
              source: "https://example.com/nissan-leaf.jpg",
            },
          },
          true,
          200
        );
      }

      // Default fallback
      return wikipediaSummaryResponse({}, false);
    });

    await expect(fetchWikipediaCarImage("Nissan", "EV")).resolves.toBe(
      "https://example.com/nissan-leaf.jpg"
    );
  });

  it("caches details and images separately", async () => {
    mockFetch
      .mockResolvedValueOnce(
        wikipediaDetailsResponse({
          extract: "The Volvo 240 is a compact executive car.",
        })
      )
      .mockResolvedValueOnce(
        wikipediaSummaryResponse({
          thumbnail: { source: "https://example.com/volvo-240.jpg" },
        })
      );

    await expect(getCarDetails("Volvo", "240", "en")).resolves.toEqual({
      description: "The Volvo 240 is a compact executive car.",
    });
    await expect(getCarDetails("Volvo", "240", "en")).resolves.toEqual({
      description: "The Volvo 240 is a compact executive car.",
    });
    await expect(fetchWikipediaCarImage("Volvo", "240")).resolves.toBe(
      "https://example.com/volvo-240.jpg"
    );
    await expect(fetchWikipediaCarImage("Volvo", "240")).resolves.toBe(
      "https://example.com/volvo-240.jpg"
    );
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("handles server errors gracefully", async () => {
    mockFetch
      .mockResolvedValueOnce(errorScenarios.server500({}))
      .mockResolvedValueOnce(errorScenarios.serviceUnavailable503({}))
      .mockResolvedValueOnce(
        wikipediaSummaryResponse({
          thumbnail: { source: "https://example.com/fallback.jpg" },
        })
      );

    await expect(fetchWikipediaCarImage("Toyota", "Corolla")).resolves.toBe(
      "https://example.com/fallback.jpg"
    );
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("handles rate limiting (429) with fallback", async () => {
    mockFetch
      .mockResolvedValueOnce(errorScenarios.rateLimited429({}))
      .mockResolvedValueOnce(
        wikipediaSummaryResponse({
          thumbnail: { source: "https://example.com/rate-limited.jpg" },
        })
      );

    await expect(fetchWikipediaCarImage("BMW", "M340i")).resolves.toBe(
      "https://example.com/rate-limited.jpg"
    );
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("validates search and pageimages flow for car images", async () => {
    mockFetch.mockImplementation((url: string) => {
      // Call 4: Search query (list=search) - must check before other Honda Civic matches
      if (url.includes("list=search") && url.includes("Honda%20Civic")) {
        return wikipediaSearchResponse("Honda Civic Hybrid");
      }

      // Call 5: Pageimages from search result - check before generic Honda Civic match
      if (url.includes("/page/summary/Honda%20Civic%20Hybrid")) {
        return mockResponse(
          {
            thumbnail: {
              source: "https://example.com/honda-civic-hybrid.jpg",
            },
          },
          true,
          200
        );
      }

      // Calls 1-3: Exact candidates - no image
      if (url.includes("/page/summary/Honda%20Civic%20automobile")) {
        return wikipediaSummaryResponse({}, false);
      }

      if (url.includes("/page/summary/Honda%20Civic%20car")) {
        return wikipediaSummaryResponse({}, false);
      }

      if (
        url.includes("/page/summary/Honda%20Civic") &&
        !url.includes("automobile") &&
        !url.includes("car") &&
        !url.includes("Hybrid")
      ) {
        return wikipediaSummaryResponse({}, false);
      }

      return wikipediaSummaryResponse({}, false);
    });

    await expect(fetchWikipediaCarImage("Honda", "Civic")).resolves.toBe(
      "https://example.com/honda-civic-hybrid.jpg"
    );
    expect(mockFetch).toHaveBeenCalledTimes(5);
  });
});
