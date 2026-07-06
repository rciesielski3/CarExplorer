import { WIKIPEDIA_API } from "../config/apiConfig";
import { getCarSpecificationsFromWikidata, getWikidataDescription, searchWikidataForCar } from "./wikidataApi";
import { CarSpecification } from "../types/CarSpecification";
import { handleApiError } from "../utils/errorHandler";
import { toastManager } from "../components/Toast";

export type CarDetailsResult = { description: string; specifications?: CarSpecification } | null;

const detailsCache = new Map<string, CarDetailsResult>();
const imageCache = new Map<string, string | null>();

const WIKIPEDIA_FETCH_OPTIONS = {
  headers: {
    Accept: "application/json",
    "Api-User-Agent":
      "CarExplorer/2.0.5 (https://rciesielski3.github.io/portfolio/#/contact)",
  },
};

const fetchWikipediaJson = async (url: string) => {
  console.log('[FETCH] Fetching:', url);
  const response = await fetch(url, WIKIPEDIA_FETCH_OPTIONS);
  const data = await response.json().catch(() => null);

  console.log('[STATUS] Status:', response.status);
  console.log('[DATA] Response data (first 200 chars):', JSON.stringify(data).slice(0, 200));

  return { data, response };
};

const isFailedResponse = (response: Response): boolean => response.ok === false;

const encodeWikipediaTitle = (title: string) =>
  encodeURIComponent(title.trim().replace(/\s+/g, "_"));

const normalizeCarNames = (make: string, model: string) => {
  const normalizedMake = make.trim();
  const normalizedModel = model.trim();
  const startsWithMake = normalizedModel
    .toLowerCase()
    .startsWith(`${normalizedMake.toLowerCase()} `);
  const modelWithoutMake = startsWithMake
    ? normalizedModel.slice(normalizedMake.length).trim()
    : normalizedModel;
  const fullName = startsWithMake
    ? normalizedModel
    : `${normalizedMake} ${normalizedModel}`.trim();

  return {
    fullName,
    modelWithoutMake,
    normalizedMake,
  };
};

const uniqueNonEmpty = (values: string[]) =>
  Array.from(
    new Set(
      values
        .map((value) => value.trim().replace(/\s+/g, " "))
        .filter(Boolean)
    )
  );

const buildWikipediaCandidates = (make: string, model: string): string[] => {
  const { fullName } = normalizeCarNames(make, model);
  return uniqueNonEmpty([
    `${fullName}`,
    `${fullName} automobile`,
    `${fullName} car`,
  ]);
};

const buildMakeCandidates = (make: string): string[] => {
  const normalizedMake = make.trim();

  return uniqueNonEmpty([
    normalizedMake,
    `${normalizedMake} automobile`,
    `${normalizedMake} car`,
  ]);
};

const getFirstPage = (data: any) => {
  const pages = data?.query?.pages;

  if (!pages || typeof pages !== "object") {
    return null;
  }

  const [pageId] = Object.keys(pages);
  return pageId ? pages[pageId] : null;
};

const getImageFromSummary = (data: any): string | null =>
  data?.thumbnail?.source || data?.originalimage?.source || null;

const getExtractFromSummary = (data: any): string | null => {
  const extract = data?.extract;
  return typeof extract === "string" && extract.trim() ? extract : null;
};

const fetchWikipediaSummary = async (
  title: string,
  language: string = "en"
): Promise<any | null> => {
  const url = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
    title
  )}`;
  const { data, response } = await fetchWikipediaJson(url);

  if (isFailedResponse(response)) {
    console.warn("Wikipedia summary lookup failed", {
      language,
      status: response.status,
      title,
    });
    return null;
  }

  return data;
};

const fetchWikipediaDetailsExtract = async (
  title: string,
  language: string = "en"
): Promise<string | null> => {
  const url = WIKIPEDIA_API.DETAILS_QUERY(
    encodeWikipediaTitle(title),
    language
  );
  const { data, response } = await fetchWikipediaJson(url);
  if (isFailedResponse(response)) {
    console.warn("Wikipedia details lookup failed", {
      language,
      status: response.status,
      title,
    });
    return null;
  }
  const page = getFirstPage(data);
  const extract = page?.extract;

  return typeof extract === "string" && extract.trim() ? extract : null;
};

const fetchWikipediaSearchTitle = async (
  query: string,
  language: string = "en"
): Promise<string | null> => {
  const url = `https://${language}.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(
    query
  )}&origin=*`;
  const { data, response } = await fetchWikipediaJson(url);
  if (isFailedResponse(response)) {
    console.warn("Wikipedia search lookup failed", {
      language,
      query,
      status: response.status,
    });
    return null;
  }
  const results = data?.query?.search;

  if (!Array.isArray(results)) {
    return null;
  }

  const result = results.find((item) => {
    const title = item?.title;

    return (
      typeof title === "string" &&
      title.trim() &&
      !title.toLowerCase().includes("disambiguation")
    );
  });

  return result?.title || null;
};

const getDetailsForTitles = async (
  titles: string[],
  language: string
): Promise<string | null> => {
  for (const title of titles) {
    try {
      const actionExtract = await fetchWikipediaDetailsExtract(title, language);

      if (actionExtract) {
        return actionExtract;
      }

      const summary = await fetchWikipediaSummary(title, language);
      const summaryExtract = getExtractFromSummary(summary);

      if (summaryExtract) {
        return summaryExtract;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn("Wikipedia details candidate threw", {
        error: message,
        language,
        title,
      });
    }
  }

  return null;
};
export async function fetchWikipediaCarImage(
  make: string,
  model: string
): Promise<string | null> {
  try {
    const cacheKey = `${make}:${model}`.toLowerCase();
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey) || null;
    }

    const candidates = buildWikipediaCandidates(make, model);
    console.log('[IMAGE_CANDIDATES]', candidates);

    let lastError: Response | Error | null = null;

    for (const title of candidates) {
      try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          title
        )}`;
        const { data, response } = await fetchWikipediaJson(url);

        if (!response.ok) {
          console.warn('[IMAGE_LOOKUP_FAILED]', title, 'status:', response.status);
          lastError = response;
          continue;
        }

        const imageUrl =
          data?.thumbnail?.source || data?.originalimage?.source || null;
        console.log('[IMAGE_FOUND]', title, ':', imageUrl);

        if (imageUrl) {
          imageCache.set(cacheKey, imageUrl);
          return imageUrl;
        }
      } catch (error) {
        console.error('[IMAGE_ERROR]', title, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }

    // Try search as fallback for images
    try {
      const { fullName } = normalizeCarNames(make, model);
      const searchTitle = await fetchWikipediaSearchTitle(fullName, "en");

      if (searchTitle) {
        console.log('[IMAGE_FROM_SEARCH]', searchTitle);
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          searchTitle
        )}`;
        const { data, response } = await fetchWikipediaJson(url);

        if (response.ok) {
          const imageUrl =
            data?.thumbnail?.source || data?.originalimage?.source || null;
          if (imageUrl) {
            console.log('[IMAGE_FOUND_FROM_SEARCH]', searchTitle, ':', imageUrl);
            imageCache.set(cacheKey, imageUrl);
            return imageUrl;
          }
        } else {
          lastError = response;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('[IMAGE_SEARCH_ERROR]', message);
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    // Try make-level candidates as final fallback
    const makeCandidates = buildMakeCandidates(make);
    for (const title of makeCandidates) {
      try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          title
        )}`;
        const { data, response } = await fetchWikipediaJson(url);

        if (!response.ok) {
          console.warn('[IMAGE_LOOKUP_FAILED]', title, 'status:', response.status);
          lastError = response;
          continue;
        }

        const imageUrl =
          data?.thumbnail?.source || data?.originalimage?.source || null;
        console.log('[IMAGE_FOUND]', title, ':', imageUrl);

        if (imageUrl) {
          imageCache.set(cacheKey, imageUrl);
          return imageUrl;
        }
      } catch (error) {
        console.error('[IMAGE_ERROR]', title, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }

    // All fallbacks exhausted - if we have an error, throw it so outer catch fires
    if (lastError) {
      throw lastError;
    }

    console.log('[NO_IMAGE]', make, model);
    imageCache.set(cacheKey, null);
    return null;
  } catch (error) {
    const result = handleApiError(error, {
      apiName: 'Wikipedia',
      action: `search_image_${make}_${model}`,
    });
    toastManager.show(result.message, 'error');
    console.warn('[WIKIPEDIA_ERROR]', result.context);
    return null;
  }
}

export const getCarImageUrl = fetchWikipediaCarImage;

export const getCarDetails = async (
  make: string,
  model: string,
  language: string = "en"
): Promise<CarDetailsResult> => {
  try {
    console.log('[DETAILS_REQUEST]', make, model, 'language:', language);
    const cacheKey = `${language}:${make}:${model}`.toLowerCase();
    if (detailsCache.has(cacheKey)) {
      console.log('[CACHE_HIT]', cacheKey);
      return detailsCache.get(cacheKey) || null;
    }

    const candidates = buildWikipediaCandidates(make, model);
    const languages = Array.from(new Set([language, "en"].filter(Boolean)));
    const { fullName } = normalizeCarNames(make, model);
    let lastError: Error | null = null;

    for (const activeLanguage of languages) {
      let exactDetails: string | null = null;
      try {
        exactDetails = await getDetailsForTitles(candidates, activeLanguage);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn("Wikipedia candidates threw", {
          activeLanguage,
          error: message,
        });
        lastError = error instanceof Error ? error : new Error(message);
      }

      if (exactDetails) {
        console.log('[DETAILS_FROM_CANDIDATES]', activeLanguage);
        const result: CarDetailsResult = { description: exactDetails };
        detailsCache.set(cacheKey, result);
        return result;
      }

      try {
        const searchTitle = await fetchWikipediaSearchTitle(
          fullName,
          activeLanguage
        );

        if (searchTitle) {
          let searchDetails: string | null = null;
          try {
            searchDetails = await getDetailsForTitles(
              [searchTitle],
              activeLanguage
            );
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn("Wikipedia search details threw", {
              activeLanguage,
              error: message,
              searchTitle,
            });
            lastError = error instanceof Error ? error : new Error(message);
          }

          if (searchDetails) {
            console.log('[DETAILS_FROM_SEARCH]', searchTitle, 'for', activeLanguage);
            const result: CarDetailsResult = { description: searchDetails };
            detailsCache.set(cacheKey, result);
            return result;
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn("Wikipedia details search threw", {
          activeLanguage,
          error: message,
          fullName,
        });
        lastError = error instanceof Error ? error : new Error(message);
      }

      let makeDetails: string | null = null;
      try {
        makeDetails = await getDetailsForTitles(
          buildMakeCandidates(make),
          activeLanguage
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn("Wikipedia make details threw", {
          activeLanguage,
          error: message,
          make,
        });
        lastError = error instanceof Error ? error : new Error(message);
      }

      if (makeDetails) {
        console.log('[DETAILS_FROM_MAKE]', activeLanguage);
        const result: CarDetailsResult = { description: makeDetails };
        detailsCache.set(cacheKey, result);
        return result;
      }
    }

    // Fallback to Wikidata when Wikipedia fails
    console.log('[WIKIPEDIA_FAILED_TRYING_WIKIDATA]', make, model);
    try {
      const wikidataId = await searchWikidataForCar(make, model, language);
      if (wikidataId) {
        const [basicDetails, specifications] = await Promise.all([
          getWikidataDescription(wikidataId, language),
          getCarSpecificationsFromWikidata(wikidataId, language),
        ]);
        if (basicDetails) {
          console.log('[DETAILS_FROM_WIKIDATA]', make, model);
          const result: CarDetailsResult = {
            description: basicDetails,
            ...(specifications ? { specifications } : {}),
          };
          detailsCache.set(cacheKey, result);
          return result;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn("Wikidata fallback threw", {
        error: message,
        make,
        model,
      });
      lastError = error instanceof Error ? error : new Error(message);
    }

    // All fallbacks exhausted - if we have an error, throw it so outer catch fires
    if (lastError) {
      throw lastError;
    }

    console.log('[NO_DETAILS]', make, model);
    detailsCache.set(cacheKey, null);
    return null;
  } catch (error) {
    const result = handleApiError(error, {
      apiName: 'Wikipedia',
      action: `get_details_${make}_${model}`,
    });
    toastManager.show(result.message, 'error');
    console.warn('[WIKIPEDIA_ERROR]', result.context);
    return null;
  }
};

export const generateRequestedLink = (
  query: string,
  language: string = "en"
) => {
  return `https://${language}.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=${encodeURIComponent(
    query.replace(/\s+/g, "_")
  )}`;
};

// For testing: clear caches
export const __clearCaches = () => {
  if (process.env.NODE_ENV !== 'production') {
    detailsCache.clear();
    imageCache.clear();
  }
};
