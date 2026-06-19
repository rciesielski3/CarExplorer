import { WIKIPEDIA_API } from "../config/apiConfig";

const imageCache = new Map<string, string | null>();

const encodeWikipediaTitle = (title: string) =>
  encodeURIComponent(title.trim().replace(/\s+/g, "_"));

const buildWikipediaCandidates = (make: string, model: string): string[] => {
  const normalizedMake = make.trim();
  const normalizedModel = model.trim();
  const makePattern = new RegExp(`^${normalizedMake}\\s+`, "i");
  const modelWithoutMake = normalizedModel.replace(makePattern, "").trim();
  const fullName = normalizedModel.match(makePattern)
    ? normalizedModel
    : `${normalizedMake} ${normalizedModel}`.trim();

  return Array.from(
    new Set(
      [
        fullName,
        `${fullName} automobile`,
        `${fullName} car`,
        `${fullName} vehicle`,
        `${normalizedMake} ${modelWithoutMake} automobile`.trim(),
        normalizedMake,
      ].filter(Boolean)
    )
  );
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
  const response = await fetch(url);

  if (!response.ok) {
    return null;
  }

  return response.json();
};

export const fetchWikipediaCarImage = async (
  make: string,
  model: string
): Promise<string | null> => {
  const cacheKey = `${make}:${model}`.toLowerCase();
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey) || null;
  }

  const candidates = buildWikipediaCandidates(make, model);

  for (const title of candidates) {
    try {
      const summary = await fetchWikipediaSummary(title);
      const summaryImage = getImageFromSummary(summary);

      if (summaryImage) {
        imageCache.set(cacheKey, summaryImage);
        return summaryImage;
      }

      const imageQueryUrl =
        WIKIPEDIA_API.BASE_URL + WIKIPEDIA_API.IMAGE_QUERY(encodeWikipediaTitle(title));
      const imageQueryResponse = await fetch(imageQueryUrl);
      const imageQueryData = await imageQueryResponse.json();
      const page = getFirstPage(imageQueryData);
      const queryImage = page?.thumbnail?.source || page?.originalimage?.source;

      if (queryImage) {
        imageCache.set(cacheKey, queryImage);
        return queryImage;
      }
    } catch {}
  }

  imageCache.set(cacheKey, null);
  return null;
};

export const getCarImageUrl = fetchWikipediaCarImage;

export const getCarDetails = async (
  make: string,
  model: string,
  language: string = "en"
) => {
  const candidates = buildWikipediaCandidates(make, model);
  const languages = Array.from(new Set([language, "en"].filter(Boolean)));

  for (const activeLanguage of languages) {
    for (const title of candidates) {
      try {
        const url = WIKIPEDIA_API.DETAILS_QUERY(
          encodeWikipediaTitle(title),
          activeLanguage
        );
        const response = await fetch(url);
        const data = await response.json();
        const page = getFirstPage(data);
        const extract = page?.extract || "";

        if (extract.trim() !== "") {
          return extract;
        }

        const summary = await fetchWikipediaSummary(title, activeLanguage);
        const summaryExtract = getExtractFromSummary(summary);

        if (summaryExtract) {
          return summaryExtract;
        }
      } catch {}
    }
  }

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
