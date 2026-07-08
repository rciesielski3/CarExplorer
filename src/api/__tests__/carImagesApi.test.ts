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
      expect.stringContaining("api_key=test-api-key-12345")
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("make=Toyota")
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("model=Corolla")
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

describe("CarImages API - Error Scenarios", () => {
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

  it("handles 500 error from CarImages", async () => {
    mockFetch.mockResolvedValueOnce(errorScenarios.server500({}));

    const result = await getCarImagesFallbackUrl({
      make: "Toyota",
      model: "Corolla",
    });

    expect(result).toBeNull();
  });

  it("handles 503 service unavailable", async () => {
    mockFetch.mockResolvedValueOnce(errorScenarios.serviceUnavailable503({}));

    const result = await getCarImagesFallbackUrl({
      make: "Honda",
      model: "Civic",
    });

    expect(result).toBeNull();
  });

  it("handles 429 rate limiting", async () => {
    mockFetch.mockResolvedValueOnce(errorScenarios.rateLimited429({}));

    const result = await getCarImagesFallbackUrl({
      make: "BMW",
      model: "M340i",
    });

    expect(result).toBeNull();
  });

  it("handles 404 gracefully", async () => {
    mockFetch.mockResolvedValueOnce(errorScenarios.notFound404({}));

    const result = await getCarImagesFallbackUrl({
      make: "Unknown",
      model: "Model",
    });

    expect(result).toBeNull();
  });

  it("error handler returns correct message for CarImages", () => {
    const { handleApiError } = require("../../utils/errorHandler");
    const result = handleApiError(
      new Response(null, { status: 500 }),
      { apiName: "CarImages", action: "fetch" }
    );

    expect(result.message).toContain("server error");
    expect(result.shouldRetry).toBe(true);
  });
});
