import axios from "axios";

import { NEWS_API } from "../config/apiConfig";

/**
 * Fetch automotive news based on the selected language.
 * @param {string} language - The user's selected language
 */
export const fetchNews = async (language: string) => {
  try {
    const selectedLanguage = NEWS_API.SUPPORTED_LANGUAGES.includes(language)
      ? language
      : "en";

    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - 1);
    const formattedFromDate = fromDate.toISOString().split("T")[0];

    const response = await axios.get(NEWS_API.BASE_URL, {
      params: {
        q: "automotive",
        from: formattedFromDate,
        apiKey: NEWS_API.API_KEY,
        language: selectedLanguage,
      },
    });

    return response.data.articles;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
};
