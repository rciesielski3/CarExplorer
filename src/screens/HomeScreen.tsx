import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle, Path } from "react-native-svg";

import {
  createGlobalStyles,
  createHomeScreenStyles,
} from "@/constants/GlobalStyles";
import { Colors } from "@/constants/Colors";

import { useTheme } from "../context/ThemeContext";
import { RootStackParamList } from "../navigation/types";
import { AdBanner } from "../components";

const HomeScreen = () => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);
  const homeStyles = createHomeScreenStyles(theme);

  const navigateTo = React.useCallback(
    (
      screen: "Explore" | "Quiz" | "Vin" | "Favorites" | "Settings" | "Compare"
    ) => {
      navigation.navigate(screen);
    },
    [navigation]
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={homeStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={homeStyles.topBar}>
          <Text style={homeStyles.logo}>{t("homeLogo", "Car Explorer")}</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("settings")}
            style={homeStyles.settingsButton}
            onPress={() => navigateTo("Settings")}
          >
            <Ionicons
              name="settings-outline"
              size={17}
              color={Colors[theme].icon}
            />
          </TouchableOpacity>
        </View>

        <View style={homeStyles.hero}>
          <View style={homeStyles.heroInner}>
            <View style={homeStyles.heroEyebrowRow}>
              <View style={homeStyles.heroEyebrowLine} />
              <Text style={homeStyles.eyebrow}>
                {t("heroEyebrow", "Your automotive companion")}
              </Text>
            </View>

            <Text style={homeStyles.heroTitle}>
              {t("heroTitleDrive", "Drive")}
              {"\n"}
              <Text style={homeStyles.heroAccent}>
                {t("heroTitleCuriosity", "Curiosity")}
              </Text>
            </Text>

            <Text style={homeStyles.heroSubtitle}>
              {t(
                "heroSubtitle",
                "Browse makes, decode VINs, compare specs side by side."
              )}
            </Text>
          </View>

          <HeroCarLine />
        </View>

        <View style={homeStyles.quickActions}>
          <QuickAction
            icon="search-outline"
            title={t("exploreCars")}
            subtitle={t("quickExploreMockupSubtitle", "Browse makes & models")}
            onPress={() => navigateTo("Explore")}
          />
          <QuickAction
            icon="shield-checkmark-outline"
            title={t("vinCheckerTitle")}
            subtitle={t(
              "quickVinMockupSubtitle",
              "Decode any vehicle"
            )}
            onPress={() => navigateTo("Vin")}
          />
          <QuickAction
            icon="bar-chart-outline"
            title={t("compare", "Compare")}
            subtitle={t("quickCompareSubtitle", "Side-by-side specs")}
            onPress={() => navigateTo("Compare")}
          />
          <QuickAction
            icon="bulb-outline"
            title={t("carQuiz", "Car Quiz")}
            subtitle={t("quickQuizMockupSubtitle", "Test your knowledge")}
            onPress={() => navigateTo("Quiz")}
          />
        </View>

        <View style={homeStyles.aiCard}>
          <View style={homeStyles.aiHeader}>
            <View style={homeStyles.aiLabelRow}>
              <View style={homeStyles.aiLabelLine} />
              <Text style={homeStyles.aiLabel}>{t("askAi", "Ask AI")}</Text>
            </View>
            <Text style={homeStyles.aiQuota}>{t("aiQuota", "5 left today")}</Text>
          </View>

          <Text style={homeStyles.aiPlaceholder}>
            {t("aiPlaceholder", "Ask anything about cars...")}
          </Text>

          <View style={homeStyles.aiFooter}>
            <View style={homeStyles.aiChips}>
              {[
                { key: "flat6", label: t("aiChipFlat6", "Flat-6") },
                { key: "bestEv", label: t("aiChipBestEv", "Best EV") },
                { key: "awdVs4wd", label: t("aiChipAwdVs4wd", "AWD vs 4WD") },
              ].map((chip) => (
                <View key={chip.key} style={homeStyles.aiChip}>
                  <Text style={homeStyles.aiChipText}>{chip.label}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t("askAi", "Ask AI")}
              style={homeStyles.aiSendButton}
            >
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <AdBanner />
    </View>
  );
};

const HeroCarLine = () => {
  const { theme } = useTheme();
  const homeStyles = createHomeScreenStyles(theme);

  return (
    <Svg
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={homeStyles.heroCarLine}
      viewBox="0 0 220 82"
    >
      <Path
        d="M4 60h30M72 60h76M192 60h24"
        stroke={Colors[theme].text}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M36 60c4-22 15-29 35-31l28-16c19-11 61-13 86 5l21 15"
        stroke={Colors[theme].text}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M86 28l-4-14M148 21l6-15"
        stroke={Colors[theme].text}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
      <Circle
        cx={50}
        cy={60}
        r={22}
        stroke={Colors[theme].text}
        strokeWidth={4}
        fill={Colors[theme].background}
      />
      <Circle
        cx={170}
        cy={60}
        r={22}
        stroke={Colors[theme].text}
        strokeWidth={4}
        fill={Colors[theme].background}
      />
    </Svg>
  );
};

const QuickAction = ({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  onPress: () => void;
}) => {
  const { theme } = useTheme();
  const homeStyles = createHomeScreenStyles(theme);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      style={homeStyles.quickAction}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={homeStyles.quickIcon}>
        <Ionicons name={icon} size={28} color={Colors[theme].accent} />
      </View>
      <Text style={homeStyles.quickTitle}>{title}</Text>
      <Text style={homeStyles.quickSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
};

export default HomeScreen;
