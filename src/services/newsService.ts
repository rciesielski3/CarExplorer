import axios from "axios";

import { NEWS_API } from "../config/apiConfig";

/**
 * Fetch automotive news based on language preference.
 */
export const fetchNews = async (language: string): Promise<any[]> => {
  try {
    const selectedLanguage = NEWS_API.SUPPORTED_LANGUAGES.includes(language)
      ? language
      : "en";

    const response = await axios.get(NEWS_API.BASE_URL, {
      params: {
        apiKey: NEWS_API.API_KEY,
        language: selectedLanguage,
      },
    });

    return response.data.articles;
  } catch (error) {
    console.error("❌ Error fetching news:", error);
    return [];
  }
};
