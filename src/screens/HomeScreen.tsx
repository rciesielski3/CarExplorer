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
import { AdBanner, LoadingIndicator, ScreenContainer } from "../components";
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
  const [aiLoading, setAiLoading] = React.useState(false);

  const navigateTo = React.useCallback(
    (
      screen: "Explore" | "Quiz" | "Vin" | "Favorites" | "Settings" | "Compare",
    ) => {
      navigation.navigate(screen);
    },
    [navigation],
  );

  const handleAskAi = React.useCallback(
    async (query = aiQuery) => {
      const trimmed = query.trim();
      if (!trimmed) {
        return;
      }
      setAiSubmitted(true);
      setAiLoading(true);

      // Simulate thinking for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAiMatch(findStaticAiAnswer(trimmed));
      setAiLoading(false);
    },
    [aiQuery],
  );

  const handleAiSuggestionPress = React.useCallback(
    async (fallbackQuestion: string, questionKey: string) => {
      const localizedQuestion = t(questionKey, fallbackQuestion);
      setAiQuery(localizedQuestion);
      setAiSubmitted(true);
      setAiLoading(true);

      // Simulate thinking for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAiMatch(findStaticAiAnswer(fallbackQuestion));
      setAiLoading(false);
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
              color={Colors[theme].accent}
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
              {aiLoading ? (
                <View style={{ alignItems: "center", paddingVertical: 16 }}>
                  <LoadingIndicator type="THINKING" />
                  <Text style={[homeStyles.aiAnswerText, { marginTop: 12, opacity: 0.7 }]}>
                    {t("aiThinking", "Thinking...")}
                  </Text>
                </View>
              ) : (
                <Text style={homeStyles.aiAnswerText}>
                  {aiMatch
                    ? t(aiMatch.answerKey, aiMatch.fallbackAnswer)
                    : t(
                        "aiNoMatch",
                        "Try asking about engines, EVs, VINs, buying tips, or drivetrain differences.",
                      )}
                </Text>
              )}
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
      viewBox="0 0 340 110"
    >
      <Path
        d="M18 78h72M132 78h92M282 78h40"
        stroke={Colors[theme].accent}
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M58 76c7-25 22-35 50-38l45-23c34-17 91-12 118 18l23 28"
        stroke={Colors[theme].accent}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M150 17l-27 24M174 14l58 3M234 18l30 24M280 47l28-4"
        stroke={Colors[theme].accent}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M25 55l-22 7M30 66l-26 8"
        stroke={Colors[theme].accent}
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0.4}
        fill="none"
      />
      <Circle
        cx={108}
        cy={78}
        r={24}
        stroke={Colors[theme].accent}
        strokeWidth={3.5}
        fill={Colors[theme].background}
      />
      <Circle
        cx={250}
        cy={78}
        r={24}
        stroke={Colors[theme].accent}
        strokeWidth={3.5}
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
