import { WIKIPEDIA_API } from "../config/apiConfig";

export const getCarImageUrl = async (make: string, model: string) => {
  try {
    const query = `${make} ${model}`.replace(/\s+/g, "_");
    const url = WIKIPEDIA_API.BASE_URL + WIKIPEDIA_API.IMAGE_QUERY(query);

    const response = await fetch(url);
    const data = await response.json();

    const pages = data.query?.pages;
    const pageId = Object.keys(pages)[0];
    const imageUrl = pages[pageId]?.thumbnail?.source;

    return imageUrl || null;
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
    const query = `${make} ${model}`.replace(/\s+/g, "_");
    const url = WIKIPEDIA_API.DETAILS_QUERY(query, language);

    const response = await fetch(url);
    const data = await response.json();

    const pages = data.query?.pages;
    const pageId = Object.keys(pages)[0];
    let extract = pages[pageId]?.extract || "";

    return extract.trim() !== "" ? extract : null;
  } catch (error) {
    console.error("❌ Error fetching car details from Wikipedia:", error);
    return null;
  }
};

export const generateRequestedLink = (
  query: string,
  language: string = "en"
) => {
  return `https://${language}.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=${query}`;
};
