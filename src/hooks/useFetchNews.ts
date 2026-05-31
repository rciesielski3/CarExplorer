import { useState, useEffect } from "react";
import axios from "axios";

import { fetchNews } from "../services/newsService";

export const useFetchNews = (language: string) => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        const newsData = await fetchNews(language);
        setNews(newsData);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          console.error("Error fetching news:", err);
          setError(`Failed to fetch news data: ${err.message}`);
        } else {
          setError("Failed to fetch news data");
        }
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [language]);

  return { news, loading, error };
};
