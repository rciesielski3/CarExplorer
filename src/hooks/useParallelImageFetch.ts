import React from "react";
import { fetchWikipediaCarImage } from "../api/wikipediaApi";
import { getCarImagesFallbackUrl, getGenericCarImageFallback } from "../api/carImagesApi";

interface UseParallelImageFetchParams {
  make: string;
  model: string;
  year?: string | null;
}

interface UseParallelImageFetchResult {
  imageUri: string | null;
  isLoading: boolean;
  sourceStep: "wiki" | "carimages" | "generic" | "fallback";
  error: string | null;
  refresh: () => void;
}

export function useParallelImageFetch(
  params: UseParallelImageFetchParams
): UseParallelImageFetchResult {
  const [imageUri, setImageUri] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sourceStep, setSourceStep] = React.useState<"wiki" | "carimages" | "generic" | "fallback">("wiki");
  const [error, setError] = React.useState<string | null>(null);

  const fetchImages = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Wrap each promise to track which API won
      const wikiPromise = fetchWikipediaCarImage(params.make, params.model).then((url) => ({
        source: "wiki" as const,
        url,
      }));

      const carImagesPromise = getCarImagesFallbackUrl({
        make: params.make,
        model: params.model,
        year: params.year,
      }).then((url) => ({
        source: "carimages" as const,
        url,
      }));

      // Race both APIs in parallel
      const result = await Promise.race([wikiPromise, carImagesPromise]);

      if (result.url) {
        setImageUri(result.url);
        setSourceStep(result.source);
        setIsLoading(false);
        return;
      }

      // If the winner returned null, try the other one
      try {
        const loser = result.source === "wiki" ? carImagesPromise : wikiPromise;
        const fallbackResult = await loser;

        if (fallbackResult.url) {
          setImageUri(fallbackResult.url);
          setSourceStep(fallbackResult.source);
          setIsLoading(false);
          return;
        }
      } catch {
        // Both APIs failed or returned null
      }

      // Fall back to generic image
      const genericImage = await getGenericCarImageFallback();
      setImageUri(genericImage);
      setSourceStep("generic");
      setIsLoading(false);
    } catch (err) {
      // Both APIs failed with exceptions
      try {
        const genericImage = await getGenericCarImageFallback();
        setImageUri(genericImage);
        setSourceStep("generic");
        setError(err instanceof Error ? err.message : "Unknown error");
        setIsLoading(false);
      } catch (fallbackErr) {
        setError(fallbackErr instanceof Error ? fallbackErr.message : "Unknown error");
        setImageUri(null);
        setSourceStep("fallback");
        setIsLoading(false);
      }
    }
  }, [params.make, params.model, params.year]);

  const refresh = React.useCallback(() => {
    fetchImages();
  }, [fetchImages]);

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      await fetchImages();
      if (!mounted) {
        setIsLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [params.make, params.model, params.year, fetchImages]);

  return {
    imageUri,
    isLoading,
    sourceStep,
    error,
    refresh,
  };
}
