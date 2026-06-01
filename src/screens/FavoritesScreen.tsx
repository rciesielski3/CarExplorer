import React from "react";
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  createGlobalStyles,
  createHomeScreenStyles,
} from "@/constants/GlobalStyles";
import { Colors } from "@/constants/Colors";

import { useFavorites } from "../context/FavoritesContext";
import { useTheme } from "../context/ThemeContext";
import CarCard from "../components/CarCard";
import { LoadingIndicator } from "../components";
import { IMAGES } from "../constants/Assets";
import { RootStackParamList } from "../navigation/types";

const FavoritesScreen = () => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);
  const stylesHome = createHomeScreenStyles(theme);

  const { favorites, isHydrated, clearFavorites } = useFavorites();

  return (
    <ImageBackground source={IMAGES.BACKGROUND} style={styles.background}>
      <View style={stylesHome.container}>
        <Text style={styles.title}>{t("favoritesTitle")}</Text>
        {!isHydrated ? (
          <LoadingIndicator type="EXPLORE" />
        ) : favorites.length === 0 ? (
          <>
            <View style={styles.resultsContainer}>
              <Text style={styles.subtitle}>{t("favoritesEmptyTitle")}</Text>
              <Text style={styles.description}>{t("favoritesEmptyHint")}</Text>
            </View>
            <View style={stylesHome.buttonContainer}>
              <TouchableOpacity
                style={[
                  stylesHome.button,
                  { backgroundColor: Colors[theme].tabIconSelected },
                ]}
                onPress={() => navigation.navigate("Explore")}
              >
                <Text style={stylesHome.buttonText}>{t("exploreCars")}</Text>
              </TouchableOpacity>
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
