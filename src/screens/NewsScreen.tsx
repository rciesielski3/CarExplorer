import React from "react";
import { View, Text, FlatList, ImageBackground } from "react-native";
import { useTranslation } from "react-i18next";

import { useFocusEffect } from "@react-navigation/native";
import {
  createGlobalStyles,
  createHomeScreenStyles,
} from "@/constants/GlobalStyles";

import { fetchNews } from "../api/newsApi";
import { useTheme } from "../context/ThemeContext";
import { useAppLanguage } from "../context/LanguageContext";
import { ErrorMessage, LoadingIndicator } from "../components";
import NewsCard from "../components/NewsCard";
import { IMAGES } from "../constants/Assets";
import { NEWS_API } from "../config/apiConfig";

const NewsScreen = () => {
  const [news, setNews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { t } = useTranslation();

  const { language } = useAppLanguage();
  const { theme } = useTheme();

  const styles = createGlobalStyles(theme);
  const homeStyles = createHomeScreenStyles(theme);

  const loadNews = React.useCallback(async () => {
    setLoading(true);
    try {
      const newsData = await fetchNews(language);
      setNews(newsData);
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useFocusEffect(
    React.useCallback(() => {
      loadNews();
    }, [loadNews])
  );

  if (loading) {
    return (
      <ImageBackground source={IMAGES.BACKGROUND} style={styles.background}>
        <View style={homeStyles.container}>
          <LoadingIndicator />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={IMAGES.BACKGROUND} style={styles.background}>
      <View style={homeStyles.container}>
        <Text style={styles.title}>{t("newsTitle")}</Text>
        {!NEWS_API.SUPPORTED_LANGUAGES.includes(language) && (
          <ErrorMessage message={t("languageFallbackMessage")} />
        )}
        {news.length === 0 ? (
          <ErrorMessage message={t("noNews")} />
        ) : (
          <FlatList
            data={news}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <NewsCard article={item} />}
          />
        )}
      </View>
    </ImageBackground>
  );
};

export default NewsScreen;
