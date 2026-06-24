import { WIKIPEDIA_API } from "../config/apiConfig";

const detailsCache = new Map<string, string | null>();

const WIKIPEDIA_FETCH_OPTIONS = {
  headers: {
    Accept: "application/json",
    "Api-User-Agent":
      "CarExplorer/2.0.5 (https://rciesielski3.github.io/portfolio/#/contact)",
  },
};

const fetchWikipediaJson = async (url: string) => {
  const response = await fetch(url, WIKIPEDIA_FETCH_OPTIONS);
  const data = await response.json().catch(() => null);

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
  const fullName = `${make} ${model}`.trim();
  return [
    `${fullName}`,
    `${fullName} automobile`,
    `${fullName} car`,
    `${make} ${model.replace(make, "").trim()} automobile`,
  ].filter(Boolean);
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
  const candidates = buildWikipediaCandidates(make, model);
  for (const title of candidates) {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        title
      )}`;
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      const imageUrl =
        data?.thumbnail?.source || data?.originalimage?.source || null;
      if (imageUrl) return imageUrl;
    } catch {
      continue;
    }
  }
  return null;
}

export const getCarImageUrl = fetchWikipediaCarImage;

export const getCarDetails = async (
  make: string,
  model: string,
  language: string = "en"
) => {
  const cacheKey = `${language}:${make}:${model}`.toLowerCase();
  if (detailsCache.has(cacheKey)) {
    return detailsCache.get(cacheKey) || null;
  }

  const candidates = buildWikipediaCandidates(make, model);
  const languages = Array.from(new Set([language, "en"].filter(Boolean)));
  const { fullName } = normalizeCarNames(make, model);

  for (const activeLanguage of languages) {
    const exactDetails = await getDetailsForTitles(candidates, activeLanguage);

    if (exactDetails) {
      detailsCache.set(cacheKey, exactDetails);
      return exactDetails;
    }

    try {
      const searchTitle = await fetchWikipediaSearchTitle(
        fullName,
        activeLanguage
      );

      if (searchTitle) {
        const searchDetails = await getDetailsForTitles(
          [searchTitle],
          activeLanguage
        );

        if (searchDetails) {
          detailsCache.set(cacheKey, searchDetails);
          return searchDetails;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn("Wikipedia details search threw", {
        activeLanguage,
        error: message,
        fullName,
      });
    }

    const makeDetails = await getDetailsForTitles(
      buildMakeCandidates(make),
      activeLanguage
    );

    if (makeDetails) {
      detailsCache.set(cacheKey, makeDetails);
      return makeDetails;
    }
  }

  detailsCache.set(cacheKey, null);
  return null;
};

export const generateRequestedLink = (
  query: string,
  language: string = "en"
) => {
  return `https://${language}.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=${encodeURIComponent(
    query.replace(/\s+/g, "_")
  )}`;
};
