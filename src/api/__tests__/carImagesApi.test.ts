import { getCarImagesFallbackUrl } from "../carImagesApi";
import { mockResponse, errorScenarios } from "./mocks";
import Constants from "expo-constants";

jest.mock("expo-constants");

describe("carImagesApi", () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch as jest.Mock;
    (Constants.expoConfig as any) = {
      extra: { CAR_IMAGES_API_KEY: "test-api-key-12345" },
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns null when API key is not configured", async () => {
    (Constants.expoConfig as any) = { extra: {} };
    const result = await getCarImagesFallbackUrl({
      make: "Toyota",
      model: "Corolla Cross",
      year: "2024",
    });

    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns signed URL when API succeeds", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ url: "https://carimagesapi.com/signed/test-url" })
    );

    const result = await getCarImagesFallbackUrl({
      make: "Toyota",
      model: "Corolla Cross",
      year: "2024",
    });

    expect(result).toBe("https://carimagesapi.com/signed/test-url");
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("type=car"),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Api-User-Agent": expect.stringContaining("CarExplorer"),
        }),
      })
    );
  });

  it("returns null when API returns error", async () => {
    mockFetch.mockResolvedValueOnce(errorScenarios.notFound404());

    const result = await getCarImagesFallbackUrl({
      make: "Toyota",
      model: "Corolla Cross",
      year: "2024",
    });

    expect(result).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("returns null when fetch fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await getCarImagesFallbackUrl({
      make: "Toyota",
      model: "Corolla Cross",
      year: "2024",
    });

    expect(result).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
