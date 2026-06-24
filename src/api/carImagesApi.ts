import Constants from "expo-constants";

const CAR_IMAGES_API_KEY = Constants.expoConfig?.extra?.CAR_IMAGES_API_KEY;

export async function getCarImagesFallbackUrl(params: {
  make: string;
  model?: string;
  year?: string | null;
}): Promise<string | null> {
  if (!CAR_IMAGES_API_KEY) {
    console.warn("CAR_IMAGES_API_KEY not configured");
    return null;
  }

  try {
    const query = new URLSearchParams({
      type: "car",
      make: params.make,
      width: "800",
      format: "webp",
      api_key: CAR_IMAGES_API_KEY,
    });
    if (params.model) query.set("model", params.model);
    if (params.year) query.set("year", params.year);

    const response = await fetch(
      `https://carimagesapi.com/api/v1/signed-url?${query.toString()}`
    );
    if (!response.ok) {
      console.warn("CarImages API error", { status: response.status });
      return null;
    }

    const data = await response.json();
    return data?.url || null;
  } catch (error) {
    console.error("CarImages fallback fetch failed:", error);
    return null;
  }
}
