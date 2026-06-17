import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
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
import { AdBanner, ScreenContainer } from "../components";
import {
  findStaticAiAnswer,
  getStaticAiSuggestions,
  StaticAiMatch,
} from "../services/staticAiAssistant";

const HomeScreen = () => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);
  const homeStyles = createHomeScreenStyles(theme);
  const aiSuggestions = React.useMemo(() => getStaticAiSuggestions(), []);
  const [aiQuery, setAiQuery] = React.useState("");
  const [aiMatch, setAiMatch] = React.useState<StaticAiMatch | null>(null);
  const [aiSubmitted, setAiSubmitted] = React.useState(false);

  const navigateTo = React.useCallback(
    (
      screen: "Explore" | "Quiz" | "Vin" | "Favorites" | "Settings" | "Compare",
    ) => {
      navigation.navigate(screen);
    },
    [navigation],
  );

  const handleAskAi = React.useCallback(
    (query = aiQuery) => {
      const trimmed = query.trim();
      if (!trimmed) {
        return;
      }
      setAiSubmitted(true);
      setAiMatch(findStaticAiAnswer(trimmed));
    },
    [aiQuery],
  );

  const handleAiSuggestionPress = React.useCallback(
    (fallbackQuestion: string, questionKey: string) => {
      const localizedQuestion = t(questionKey, fallbackQuestion);
      setAiQuery(localizedQuestion);
      setAiSubmitted(true);
      setAiMatch(findStaticAiAnswer(fallbackQuestion));
    },
    [t],
  );

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={homeStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
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
                "Browse makes, decode VINs, compare specs side by side.",
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
            subtitle={t("quickVinMockupSubtitle", "Decode any vehicle")}
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
            <Text style={homeStyles.aiQuota}>
              {t("aiQuota", "5 left today")}
            </Text>
          </View>

          <TextInput
            accessibilityLabel={t(
              "aiPlaceholder",
              "Ask anything about cars...",
            )}
            value={aiQuery}
            onChangeText={(value) => {
              setAiQuery(value);
              setAiSubmitted(false);
              setAiMatch(null);
            }}
            placeholder={t("aiPlaceholder", "Ask anything about cars...")}
            placeholderTextColor={Colors[theme].tabIconDefault}
            style={homeStyles.aiInput}
            multiline
            maxLength={120}
            returnKeyType="send"
            blurOnSubmit
            onSubmitEditing={() => handleAskAi()}
          />

          {aiSubmitted && (
            <View style={homeStyles.aiAnswerCard}>
              <Text style={homeStyles.aiAnswerText}>
                {aiMatch
                  ? t(aiMatch.answerKey, aiMatch.fallbackAnswer)
                  : t(
                      "aiNoMatch",
                      "Try asking about engines, EVs, VINs, buying tips, or drivetrain differences.",
                    )}
              </Text>
            </View>
          )}

          <View style={homeStyles.aiFooter}>
            <View style={homeStyles.aiChips}>
              {aiSuggestions.map((chip) => (
                <TouchableOpacity
                  key={chip.id}
                  accessibilityRole="button"
                  style={homeStyles.aiChip}
                  onPress={() =>
                    handleAiSuggestionPress(
                      chip.fallbackQuestion,
                      chip.questionKey,
                    )
                  }
                >
                  <Text style={homeStyles.aiChipText}>
                    {t(chip.questionKey, chip.fallbackQuestion)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t("askAi", "Ask AI")}
              style={homeStyles.aiSendButton}
              onPress={() => handleAskAi()}
            >
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
        <AdBanner />
      </KeyboardAvoidingView>
    </ScreenContainer>
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
