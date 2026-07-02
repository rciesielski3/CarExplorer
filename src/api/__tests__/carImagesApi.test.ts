import { getCarImagesFallbackUrl } from "../carImagesApi";
import { mockResponse, errorScenarios } from "./mocks";

describe("carImagesApi", () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns null when API key is not configured", async () => {
    const result = await getCarImagesFallbackUrl({
      make: "Toyota",
      model: "Corolla Cross",
      year: "2024",
    });

    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns null when API returns error", async () => {
    mockFetch.mockResolvedValueOnce(errorScenarios.notFound404());

    const result = await getCarImagesFallbackUrl({
      make: "Toyota",
      model: "Corolla Cross",
      year: "2024",
    });

    expect(result).toBeNull();
  });

  it("returns null when fetch fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await getCarImagesFallbackUrl({
      make: "Toyota",
      model: "Corolla Cross",
      year: "2024",
    });

    expect(result).toBeNull();
  });
});
