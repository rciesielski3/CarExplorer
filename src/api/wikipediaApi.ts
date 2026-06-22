import { WIKIPEDIA_API } from "../config/apiConfig";

const imageCache = new Map<string, string | null>();
const detailsCache = new Map<string, string | null>();

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
  const { fullName, modelWithoutMake, normalizedMake } = normalizeCarNames(
    make,
    model
  );

  return uniqueNonEmpty([
    fullName,
    `${fullName} automobile`,
    `${fullName} car`,
    `${fullName} vehicle`,
    `${normalizedMake} ${modelWithoutMake} automobile`,
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
  const response = await fetch(url);

  if (!response.ok) {
    return null;
  }

  return response.json();
};

const fetchWikipediaDetailsExtract = async (
  title: string,
  language: string = "en"
): Promise<string | null> => {
  const url = WIKIPEDIA_API.DETAILS_QUERY(
    encodeWikipediaTitle(title),
    language
  );
  const response = await fetch(url);
  const data = await response.json();
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
  const response = await fetch(url);
  const data = await response.json();
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

const fetchWikipediaPageImage = async (
  title: string
): Promise<string | null> => {
  const imageQueryUrl =
    WIKIPEDIA_API.BASE_URL +
    WIKIPEDIA_API.IMAGE_QUERY(encodeWikipediaTitle(title));
  const imageQueryResponse = await fetch(imageQueryUrl);
  const imageQueryData = await imageQueryResponse.json();
  const page = getFirstPage(imageQueryData);

  return page?.thumbnail?.source || page?.originalimage?.source || null;
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
    } catch {}
  }

  return null;
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

      const queryImage = summary ? await fetchWikipediaPageImage(title) : null;

      if (queryImage) {
        imageCache.set(cacheKey, queryImage);
        return queryImage;
      }
    } catch {}
  }

  const { fullName } = normalizeCarNames(make, model);
  let searchTitle: string | null = null;

  try {
    searchTitle = await fetchWikipediaSearchTitle(fullName);
  } catch {}

  if (searchTitle) {
    try {
      const summary = await fetchWikipediaSummary(searchTitle);
      const summaryImage = getImageFromSummary(summary);

      if (summaryImage) {
        imageCache.set(cacheKey, summaryImage);
        return summaryImage;
      }

      const queryImage = summary ? await fetchWikipediaPageImage(searchTitle) : null;

      if (queryImage) {
        imageCache.set(cacheKey, queryImage);
        return queryImage;
      }
    } catch {}
  }

  for (const title of buildMakeCandidates(make)) {
    try {
      const summary = await fetchWikipediaSummary(title);
      const summaryImage = getImageFromSummary(summary);

      if (summaryImage) {
        imageCache.set(cacheKey, summaryImage);
        return summaryImage;
      }

      const queryImage = await fetchWikipediaPageImage(title);

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
    } catch {}

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
