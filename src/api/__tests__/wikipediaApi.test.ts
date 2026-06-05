import { getCarDetails, getCarImageUrl } from "../wikipediaApi";

const mockFetch = jest.fn();

global.fetch = mockFetch as jest.Mock;

const wikipediaResponse = (pages: Record<string, unknown>) =>
  Promise.resolve({
    json: () => Promise.resolve({ query: { pages } }),
  });

describe("wikipediaApi", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("falls back from make and model image lookup to make-only lookup", async () => {
    mockFetch
      .mockResolvedValueOnce(wikipediaResponse({ "1": {} }))
      .mockResolvedValueOnce(
        wikipediaResponse({
          "2": { thumbnail: { source: "https://example.com/toyota.jpg" } },
        })
      );

    await expect(getCarImageUrl("Toyota", "Corolla")).resolves.toBe(
      "https://example.com/toyota.jpg"
    );
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("encodes image lookup queries before calling Wikipedia", async () => {
    mockFetch
      .mockResolvedValueOnce(wikipediaResponse({ "1": {} }))
      .mockResolvedValueOnce(wikipediaResponse({ "2": {} }));

    await getCarImageUrl("Citroën", "C3");

    expect(mockFetch.mock.calls[0][0]).toContain("Citro%C3%ABn_C3");
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
