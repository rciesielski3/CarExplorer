import React from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";

import {
  createGlobalStyles,
  createHomeScreenStyles,
} from "@/constants/GlobalStyles";

import {
  getCarImageUrl,
  getCarDetails,
  generateRequestedLink,
} from "../api/wikipediaApi";
import { useAppLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import {
  AdBanner,
  CustomButton,
  CustomInput,
  ErrorMessage,
  LoadingIndicator,
  ScreenContainer,
} from "../components";

interface CarDetails {
  make: string;
  model: string;
  image: string | null;
  description: string;
requestedLink?: string;
}

const DiscoverScreen = () => {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<CarDetails | null>(null);
  const [error, setError] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const { t } = useTranslation();

  const { language } = useAppLanguage();
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);
  const stylesHome = createHomeScreenStyles(theme);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return setError(t("pleaseEnterValidMake"));
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
const query = `${searchQuery}`.replace(/\s+/g, "_");
      const imageUrl = await getCarImageUrl(searchQuery, "");
      const details = await getCarDetails(searchQuery, "", language);
const requestedLink = generateRequestedLink(query, language);

      if (!details) {
        return setError(t("noResultsFound"));
      }

      setResult({
        make: searchQuery,
        model: "",
        image: imageUrl,
        description: details || t("noDescriptionAvailable"),
requestedLink,
      });
    } catch (err) {
      setError(t("errorFetchingData"));
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setError("");
    setResult(null);
  };

  return (
    <ScreenContainer>
      <View style={stylesHome.container}>
        <Text style={styles.title}>{t("discover")}</Text>
        <CustomInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t("enterCarName")}
        />
        <View style={styles.buttonContainer}>
          <CustomButton
            title={t("search")}
            onPress={handleSearch}
            variant="success"
          />
          <CustomButton
            title={t("clear")}
            onPress={handleClear}
            variant="secondary"
          />
        </View>
        {loading && <LoadingIndicator />}
        <ErrorMessage message={error} />
        {result && (
          <ScrollView style={styles.scrollContainer}>
            <View style={styles.resultsContainer}>
              {result.image && (
                <Image source={{ uri: result.image }} style={styles.image} />
              )}
              <Text style={styles.description}>{result.description}</Text>
              <Text style={styles.source}>{result.requestedLink}</Text>
            </View>
          </ScrollView>
        )}
      </View>
          <AdBanner />
    </ScreenContainer>
  );
};

export default DiscoverScreen;
