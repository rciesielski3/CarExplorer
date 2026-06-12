import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
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
    (screen: "Explore" | "Quiz" | "Vin" | "Favorites" | "Settings") => {
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

          <Ionicons
            name="car-sport-outline"
            size={214}
            color={Colors[theme].text}
            style={homeStyles.heroCarOutline}
          />
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
            onPress={() => navigateTo("Explore")}
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
              {["Flat-6", "Best EV", "AWD vs 4WD"].map((chip) => (
                <View key={chip} style={homeStyles.aiChip}>
                  <Text style={homeStyles.aiChipText}>{chip}</Text>
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
