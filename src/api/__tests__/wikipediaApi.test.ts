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

  it("returns null when details response has no pages", async () => {
    mockFetch
      .mockResolvedValueOnce(
        Promise.resolve({
          json: () => Promise.resolve({ query: {} }),
        })
      )
      .mockResolvedValueOnce(
        Promise.resolve({
          json: () => Promise.resolve({ query: {} }),
        })
      );

    await expect(getCarDetails("Unknown", "Model", "en")).resolves.toBeNull();
  });
});
