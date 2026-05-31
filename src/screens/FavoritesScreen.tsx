import React from "react";
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";

import {
  createGlobalStyles,
  createHomeScreenStyles,
} from "@/constants/GlobalStyles";
import { Colors } from "@/constants/Colors";

import { useFavorites } from "../context/FavoritesContext";
import { useTheme } from "../context/ThemeContext";
import CarCard from "../components/CarCard";
import { ErrorMessage, LoadingIndicator } from "../components";
import { IMAGES } from "../constants/Assets";

const FavoritesScreen = () => {
  const { t } = useTranslation();

  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);
  const stylesHome = createHomeScreenStyles(theme);

  const { favorites, clearFavorites } = useFavorites();

  return (
    <ImageBackground source={IMAGES.BACKGROUND} style={styles.background}>
      <View style={stylesHome.container}>
        <Text style={styles.title}>{t("favoritesTitle")}</Text>
        {favorites.length === 0 ? (
          <>
            <ErrorMessage message={t("noFavorites")} />
            <View style={{ marginTop: "20%" }}>
              <LoadingIndicator type="EXPLORE" />
            </View>
          </>
        ) : (
          <>
            <FlatList
              data={favorites}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <CarCard make={item.make} model={item.model} />
              )}
            />
            <View
              style={[
                stylesHome.buttonContainer,
                { marginTop: "2%", marginBottom: "-2%" },
              ]}
            >
              <TouchableOpacity
                style={[
                  stylesHome.button,
                  { backgroundColor: Colors[theme].not },
                ]}
                onPress={clearFavorites}
              >
                <Text style={stylesHome.buttonText}>{t("clearFavorites")}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ImageBackground>
  );
};

export default FavoritesScreen;
