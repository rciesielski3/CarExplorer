import Constants from "expo-constants";
import { handleApiError } from "../utils/errorHandler";
import { toastManager } from "../components/Toast";

const GENERIC_CAR_IMAGE = "https://placehold.co/300x200?text=Car+Image";

export async function getCarImagesFallbackUrl(params: {
  make: string;
  model?: string;
  year?: string | null;
}): Promise<string | null> {
  const apiKey = Constants.expoConfig?.extra?.CAR_IMAGES_API_KEY;

  // Guard: skip this optional tier if API key is not configured or is a placeholder
  if (!apiKey || apiKey.includes("your-api-key")) {
    console.warn(
      "[CAR_IMAGES_API] API key not configured. This is an optional tier. Check app.json extra.CAR_IMAGES_API_KEY if you want to enable CarImages API fallback."
    );
    return null;
  }

  try {
    const url = new URL("https://carimagesapi.com/api/v1/signed-url");
    url.searchParams.append("api_key", apiKey);
    url.searchParams.append("make", params.make);
    if (params.model) {
      url.searchParams.append("model", params.model);
    }

    const response = await fetch(url.toString());
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

export async function getGenericCarImageFallback(): Promise<string> {
  return GENERIC_CAR_IMAGE;
}
