import { WIKIPEDIA_API } from "../config/apiConfig";

const imageCache = new Map<string, string | null>();

const buildQueryCandidates = (make: string, model: string) => {
  const normalizedMake = make.trim();
  const normalizedModel = model.trim();
  const candidates = normalizedModel
    ? [`${normalizedMake} ${normalizedModel}`, normalizedMake]
    : [normalizedMake];

  return Array.from(new Set(candidates.filter(Boolean))).map((query) =>
    encodeURIComponent(query.replace(/\s+/g, "_"))
  );
};

const buildWikipediaCandidates = (make: string, model: string): string[] => {
  const normalizedMake = make.trim();
  const normalizedModel = model.trim();
  const fullName = `${normalizedMake} ${normalizedModel}`.trim();
  const modelWithoutMake = normalizedModel.replace(normalizedMake, "").trim();

  return Array.from(
    new Set(
      [
        fullName,
        `${fullName} automobile`,
        `${fullName} car`,
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
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        title
      )}`;
      const response = await fetch(url);
      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const imageUrl = data?.thumbnail?.source || data?.originalimage?.source;

      if (imageUrl) {
        imageCache.set(cacheKey, imageUrl);
        return imageUrl;
      }
    } catch (error) {
      console.error("❌ Error fetching car image from Wikipedia:", error);
    }
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
  try {
    const queries = buildQueryCandidates(make, model);

    for (const query of queries) {
      const url = WIKIPEDIA_API.DETAILS_QUERY(query, language);
      const response = await fetch(url);
      const data = await response.json();
      const page = getFirstPage(data);
      const extract = page?.extract || "";

      if (extract.trim() !== "") {
        return extract;
      }
    }

    return null;
  } catch (error) {
    console.error("❌ Error fetching car details from Wikipedia:", error);
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
