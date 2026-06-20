import React from "react";
import { View, Text, FlatList } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  createGlobalStyles,
  createHomeScreenStyles,
} from "@/constants/GlobalStyles";
import { useCompare } from "../context/CompareContext";
import { useFavorites } from "../context/FavoritesContext";
import { useTheme } from "../context/ThemeContext";
import CarCard from "../components/CarCard";
import {
  CompareFloatingBar,
  CustomButton,
  LoadingIndicator,
  ScreenContainer,
} from "../components";
import { RootStackParamList } from "../navigation/types";

const FavoritesScreen = () => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const { theme } = useTheme();
  const { compareList } = useCompare();
  const styles = createGlobalStyles(theme);
  const stylesHome = createHomeScreenStyles(theme);
  const bottomNavOffset = Math.max(insets.bottom + 12, 18) + 78;
  const stickyFooterBottom =
    compareList.length >= 2 ? bottomNavOffset + 82 : bottomNavOffset;

  const { favorites, isHydrated, clearFavorites } = useFavorites();

  return (
    <ScreenContainer>
      <View style={stylesHome.container}>
        <Text style={styles.title}>{t("favoritesTitle")}</Text>
        {!isHydrated ? (
          <LoadingIndicator type="EXPLORE" />
        ) : favorites.length === 0 ? (
          <View style={styles.compareEmptyStateWrapper}>
            <View style={styles.compareEmptyCard}>
              <Text style={styles.subtitle}>{t("favoritesEmptyTitle")}</Text>
              <Text style={styles.compareEmptyText}>
                {t("favoritesEmptyHint")}
              </Text>
              <CustomButton
                title={t("exploreCars")}
                onPress={() => navigation.navigate("Explore")}
              />
            </View>
          </View>
        ) : (
          <>
            <FlatList
              data={favorites}
              keyExtractor={(item, index) => index.toString()}
              style={styles.flexFill}
              contentContainerStyle={[
                styles.listContent,
                styles.listContentWithStickyAction,
              ]}
              renderItem={({ item }) => (
                <CarCard make={item.make} model={item.model} showCompare />
              )}
            />
            <View
              style={[
                styles.stickyNavFooter,
                { bottom: stickyFooterBottom },
              ]}
            >
              <CustomButton
                title={t("clearFavorites")}
                onPress={clearFavorites}
                variant="danger"
              />
            </View>
          </>
        )}
      </View>
      <CompareFloatingBar />
    </ScreenContainer>
  );
};

export default FavoritesScreen;
