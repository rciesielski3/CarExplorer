import Constants from "expo-constants";
import { handleApiError } from "../utils/errorHandler";
import { toastManager } from "../components/Toast";

export async function getCarImagesFallbackUrl(params: {
  make: string;
  model?: string;
  year?: string | null;
}): Promise<string | null> {
  const CAR_IMAGES_API_KEY = Constants.expoConfig?.extra?.CAR_IMAGES_API_KEY;

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
      const result = handleApiError(response as any, {
        apiName: "CarImages",
        action: `fetch_${params.make}_${params.model || ""}`,
      });
      toastManager.show(result.message, "error");
      console.warn("[CARIMAGES_ERROR]", result.context);
      return null;
    }

    const data = await response.json();
    return data?.url || null;
  } catch (error) {
    const errorToThrow = error instanceof Error ? error : new Error(String(error));
    const result = handleApiError(errorToThrow, {
      apiName: "CarImages",
      action: `fetch_${params.make}_${params.model || ""}`,
    });
    toastManager.show(result.message, "error");
    console.warn("[CARIMAGES_ERROR]", result.context);
    return null;
  }
}
