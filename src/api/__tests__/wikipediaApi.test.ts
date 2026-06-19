import { fetchWikipediaCarImage, getCarDetails } from "../wikipediaApi";

const mockFetch = jest.fn();

global.fetch = mockFetch as jest.Mock;

const wikipediaSummaryResponse = (
  data: Record<string, unknown>,
  ok: boolean = true
) =>
  Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  });

describe("wikipediaApi", () => {
  beforeEach(() => {
    mockFetch.mockReset();
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

  it("returns null when details response has no pages", async () => {
    mockFetch.mockResolvedValue(
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ query: {} }),
      })
    );

    await expect(getCarDetails("Unknown", "Model", "en")).resolves.toBeNull();
  });

  it("falls back to Wikipedia summary extract when query details are empty", async () => {
    mockFetch
      .mockResolvedValueOnce(
        Promise.resolve({
          json: () => Promise.resolve({ query: {} }),
        })
      )
      .mockResolvedValueOnce(
        wikipediaSummaryResponse({
          extract: "The Ford Crown Victoria is a full-size sedan.",
        })
      );

    await expect(getCarDetails("Ford", "Crown Victoria", "en")).resolves.toBe(
      "The Ford Crown Victoria is a full-size sedan."
    );
  });

  it("uses English details fallback when selected language has no details", async () => {
    mockFetch
      .mockResolvedValueOnce(
        Promise.resolve({
          json: () => Promise.resolve({ query: {} }),
        })
      )
      .mockResolvedValueOnce(wikipediaSummaryResponse({}, false))
      .mockResolvedValueOnce(
        Promise.resolve({
          json: () => Promise.resolve({ query: {} }),
        })
      )
      .mockResolvedValueOnce(wikipediaSummaryResponse({}, false))
      .mockResolvedValueOnce(
        Promise.resolve({
          json: () => Promise.resolve({ query: {} }),
        })
      )
      .mockResolvedValueOnce(wikipediaSummaryResponse({}, false))
      .mockResolvedValueOnce(
        Promise.resolve({
          json: () => Promise.resolve({ query: {} }),
        })
      )
      .mockResolvedValueOnce(wikipediaSummaryResponse({}, false))
      .mockResolvedValueOnce(
        Promise.resolve({
          json: () => Promise.resolve({ query: {} }),
        })
      )
      .mockResolvedValueOnce(wikipediaSummaryResponse({}, false))
      .mockResolvedValueOnce(
        Promise.resolve({
          json: () => Promise.resolve({ query: {} }),
        })
      )
      .mockResolvedValueOnce(
        wikipediaSummaryResponse({
          extract: "The Toyota Corolla is a compact car.",
        })
      );

    await expect(getCarDetails("Toyota", "Corolla", "pl")).resolves.toBe(
      "The Toyota Corolla is a compact car."
    );
  });
});
