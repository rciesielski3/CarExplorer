import { WIKIPEDIA_API } from "../config/apiConfig";

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

const getFirstPage = (data: any) => {
  const pages = data?.query?.pages;

  if (!pages || typeof pages !== "object") {
    return null;
  }

  const [pageId] = Object.keys(pages);
  return pageId ? pages[pageId] : null;
};

export const getCarImageUrl = async (make: string, model: string) => {
  try {
    const queries = buildQueryCandidates(make, model);

    for (const query of queries) {
      const url = WIKIPEDIA_API.BASE_URL + WIKIPEDIA_API.IMAGE_QUERY(query);
      const response = await fetch(url);
      const data = await response.json();
      const page = getFirstPage(data);
      const imageUrl = page?.thumbnail?.source;

      if (imageUrl) {
        return imageUrl;
      }
    }

    return null;
  } catch (error) {
    console.error("❌ Error fetching car image from Wikipedia:", error);
    return null;
  }
};

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
