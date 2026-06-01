import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from "react-native";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import {
  createGlobalStyles,
  createHomeScreenStyles,
} from "@/constants/GlobalStyles";
import { Colors } from "@/constants/Colors";

import { useTheme } from "../context/ThemeContext";
import { useFavorites } from "../context/FavoritesContext";
import { RootStackParamList } from "../navigation/types";
import { ANIMATIONS, IMAGES } from "../constants/Assets";

const HomeScreen = () => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { theme } = useTheme();
  const { favorites } = useFavorites();
  const styles = createGlobalStyles(theme);
  const homeStyles = createHomeScreenStyles(theme);

  const navigateTo = React.useCallback(
    (screen: "Explore" | "Quiz" | "Discover" | "Vin" | "Favorites") => {
      navigation.navigate(screen);
    },
    [navigation]
  );

  return (
    <ImageBackground source={IMAGES.BACKGROUND} style={styles.background}>
      <ScrollView contentContainerStyle={homeStyles.scrollContent}>
        <View style={homeStyles.hero}>
          <LottieView
            source={ANIMATIONS.CAR}
            autoPlay
            loop
            style={homeStyles.animation}
          />
          <Text style={styles.title}>{t("homeTitle")}</Text>
          <Text style={homeStyles.subtitle}>{t("homeSubtitle")}</Text>
        </View>

        <View style={homeStyles.statsRow}>
          <View style={homeStyles.statPill}>
            <Ionicons
              name="heart"
              size={18}
              color={Colors[theme].tabIconSelected}
            />
            <Text style={homeStyles.statText}>
              {favorites.length > 0
                ? t("homeGarageCount", { count: favorites.length })
                : t("homeGarageEmpty")}
            </Text>
          </View>
        </View>

        <View style={homeStyles.quickActions}>
          <QuickAction
            icon="scan-outline"
            title={t("vinCheckerTitle")}
            subtitle={t("quickVinSubtitle")}
            color={Colors[theme].ok}
            onPress={() => navigateTo("Vin")}
          />
          <QuickAction
            icon="car-sport-outline"
            title={t("exploreCars")}
            subtitle={t("quickExploreSubtitle")}
            color={Colors[theme].tabIconSelected}
            onPress={() => navigateTo("Explore")}
          />
          <QuickAction
            icon="help-circle-outline"
            title={t("takeQuiz")}
            subtitle={t("quickQuizSubtitle")}
            color={Colors[theme].tint}
            onPress={() => navigateTo("Quiz")}
          />
          <QuickAction
            icon="book-outline"
            title={t("discover")}
            subtitle={t("quickDiscoverSubtitle")}
            color={Colors[theme].icon}
            onPress={() => navigateTo("Discover")}
          />
          {favorites.length > 0 && (
            <QuickAction
              icon="heart-outline"
              title={t("browseFavorites")}
              subtitle={favorites
                .slice(0, 2)
                .map((car) => `${car.make} ${car.model}`)
                .join(" · ")}
              color={Colors[theme].not}
              onPress={() => navigateTo("Favorites")}
            />
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const QuickAction = ({
  icon,
  title,
  subtitle,
  color,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}) => {
  const { theme } = useTheme();
  const homeStyles = createHomeScreenStyles(theme);
  return (
    <TouchableOpacity style={homeStyles.quickAction} onPress={onPress}>
      <View style={[homeStyles.quickIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={22} color="#fff" />
      </View>
      <View style={homeStyles.quickCopy}>
        <Text style={homeStyles.quickTitle}>{title}</Text>
        <Text style={homeStyles.quickSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors[theme].text} />
    </TouchableOpacity>
  );
};

export default HomeScreen;
