import React from "react";
import { fetchWikipediaCarImage } from "../api/wikipediaApi";
import { getCarImagesFallbackUrl, getGenericCarImageFallback } from "../api/carImagesApi";
import { wikipediaThrottler } from "../utils/requestThrottler";

export interface UseParallelImageFetchParams {
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

  // Tracks whether the component is still mounted so async callbacks can
  // avoid updating state after unmount.
  const mountedRef = React.useRef(true);

  // Tracks the ID of the most recently started fetch. Because two
  // fetchImages() calls can be in flight at once (e.g. params change
  // mid-fetch), each call captures its own ID and every state update is
  // gated on that ID still being the current one. This prevents a stale,
  // slower fetch from overwriting the result of a newer fetch.
  const fetchIdRef = React.useRef(0);

  const setImageUriIfMounted = React.useCallback(
    (uri: string | null, fetchId: number) => {
      if (mountedRef.current && fetchId === fetchIdRef.current) setImageUri(uri);
    },
    []
  );
  const setSourceStepIfMounted = React.useCallback(
    (step: "wiki" | "carimages" | "generic" | "fallback", fetchId: number) => {
      if (mountedRef.current && fetchId === fetchIdRef.current) setSourceStep(step);
    },
    []
  );
  const setIsLoadingIfMounted = React.useCallback(
    (loading: boolean, fetchId: number) => {
      if (mountedRef.current && fetchId === fetchIdRef.current) setIsLoading(loading);
    },
    []
  );
  const setErrorIfMounted = React.useCallback(
    (err: string | null, fetchId: number) => {
      if (mountedRef.current && fetchId === fetchIdRef.current) setError(err);
    },
    []
  );

  const fetchImages = React.useCallback(async () => {
    const currentFetchId = ++fetchIdRef.current;
    setIsLoadingIfMounted(true, currentFetchId);
    setErrorIfMounted(null, currentFetchId);

    try {
      // Wrap each promise to track which API won. Wikipedia requests are
      // throttled to avoid unthrottled concurrent hits against their API.
      const wikiPromise = wikipediaThrottler
        .execute(() => fetchWikipediaCarImage(params.make, params.model))
        .then((url) => ({
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

      // Race both APIs in parallel. Rejections are converted to a
      // null-result so a fast failure on one API doesn't abort the race
      // before the other API has a chance to respond (spec: only fall back
      // to generic once BOTH APIs have failed/returned null).
      const result = await Promise.race([
        wikiPromise.catch(() => ({ source: "wiki" as const, url: null })),
        carImagesPromise.catch(() => ({ source: "carimages" as const, url: null })),
      ]);

      if (result.url) {
        setImageUriIfMounted(result.url, currentFetchId);
        setSourceStepIfMounted(result.source, currentFetchId);
        setIsLoadingIfMounted(false, currentFetchId);
        return;
      }

      // If the winner returned null (or rejected), try the other one
      try {
        const loser = result.source === "wiki" ? carImagesPromise : wikiPromise;
        const fallbackResult = await loser;

        if (fallbackResult.url) {
          setImageUriIfMounted(fallbackResult.url, currentFetchId);
          setSourceStepIfMounted(fallbackResult.source, currentFetchId);
          setIsLoadingIfMounted(false, currentFetchId);
          return;
        }
      } catch {
        // Both APIs failed or returned null
      }

      // Fall back to generic image
      const genericImage = await getGenericCarImageFallback();
      setImageUriIfMounted(genericImage, currentFetchId);
      setSourceStepIfMounted("generic", currentFetchId);
      setIsLoadingIfMounted(false, currentFetchId);
    } catch (err) {
      // Both APIs failed with exceptions
      try {
        const genericImage = await getGenericCarImageFallback();
        setImageUriIfMounted(genericImage, currentFetchId);
        setSourceStepIfMounted("generic", currentFetchId);
        setErrorIfMounted(
          err instanceof Error ? err.message : "Unknown error",
          currentFetchId
        );
        setIsLoadingIfMounted(false, currentFetchId);
      } catch (fallbackErr) {
        setErrorIfMounted(
          fallbackErr instanceof Error ? fallbackErr.message : "Unknown error",
          currentFetchId
        );
        setImageUriIfMounted(null, currentFetchId);
        setSourceStepIfMounted("fallback", currentFetchId);
        setIsLoadingIfMounted(false, currentFetchId);
      }
    }
  }, [
    params.make,
    params.model,
    params.year,
    setImageUriIfMounted,
    setSourceStepIfMounted,
    setIsLoadingIfMounted,
    setErrorIfMounted,
  ]);

  const refresh = React.useCallback(() => {
    if (!mountedRef.current) return;
    fetchImages();
  }, [fetchImages]);

  React.useEffect(() => {
    mountedRef.current = true;

    fetchImages();

    return () => {
      mountedRef.current = false;
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
