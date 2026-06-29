import React from "react";
import { View, Text, Switch, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import {
  createGlobalStyles,
  createHomeScreenStyles,
} from "@/constants/GlobalStyles";

import { useTheme } from "../context/ThemeContext";
import { useAppLanguage } from "../context/LanguageContext";
import ReusableModalSelector from "../components/ReusableModalSelector";
import { AboutModal, ConfirmModal, ScreenContainer } from "../components";
import { useFavorites } from "../context/FavoritesContext";
import { useCompare } from "../context/CompareContext";
import { usePremium } from "../context/PremiumContext";
import { Colors } from "@/constants/Colors";

const SettingsScreen = () => {
  const { t } = useTranslation();

  const { language, setLanguage } = useAppLanguage();
  const { theme, toggleTheme } = useTheme();
  const { clearFavorites } = useFavorites();
  const { resetCompare } = useCompare();
  const { isPremium, setIsPremium } = usePremium();
  const styles = createGlobalStyles(theme);
  const homeStyles = createHomeScreenStyles(theme);
  const [showAbout, setShowAbout] = React.useState(false);
  const [showResetModal, setShowResetModal] = React.useState(false);
  const [resetSuccess, setResetSuccess] = React.useState(false);

  const handleReset = () => {
    clearFavorites();
    resetCompare();
    setShowResetModal(false);
    setResetSuccess(true);
  };

  const languageOptions = React.useMemo(
    () => [
      { key: "en", label: "English", value: "en" },
      { key: "de", label: "Deutsch", value: "de" },
      { key: "pl", label: "Polski", value: "pl" },
      { key: "fr", label: "Français", value: "fr" },
    ],
    []
  );

  return (
    <ScreenContainer>
      <View style={homeStyles.container}>
        <Text style={styles.title}>{t("settings")}</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t("darkMode")}</Text>
          <Switch value={theme === "dark"} onValueChange={toggleTheme} />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t("language")}</Text>
          <ReusableModalSelector
            label={t("selectLanguage")}
            data={languageOptions}
            selectedValue={language}
            onValueChange={setLanguage}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t("premium", "Remove Ads")}</Text>
          <Switch
            value={isPremium}
            onValueChange={setIsPremium}
            accessible={true}
            accessibilityLabel={t("premiumAccessibility", "Toggle ad-free mode")}
          />
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.settingRow}
          onPress={() => setShowResetModal(true)}
        >
          <Text style={styles.settingLabel}>
            {t("resetDataTitle", "Reset all data")}
          </Text>
          <Ionicons
            name="trash-outline"
            size={18}
            color={Colors[theme].icon}
          />
        </TouchableOpacity>
        {resetSuccess && (
          <Text style={styles.emptyText}>
            {t("resetDataSuccess", "All data cleared")}
          </Text>
        )}
          <TouchableOpacity
          accessibilityRole="button"
          style={styles.settingRow}
          onPress={() => setShowAbout(true)}
          >
          <Text style={styles.settingLabel}>{t("about", "About")}</Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={Colors[theme].icon}
          />
          </TouchableOpacity>
      </View>
      <ConfirmModal
        visible={showResetModal}
        title={t("resetDataTitle", "Reset all data")}
        message={t(
          "resetDataMessage",
          "This will clear your Garage and comparison selections permanently."
        )}
        cancelLabel={t("resetDataCancel", "Cancel")}
        confirmLabel={t("resetDataConfirm", "Reset")}
        onCancel={() => setShowResetModal(false)}
        onConfirm={handleReset}
      />
      <AboutModal
        visible={showAbout}
        title={t("aboutTitle", "Car Explorer")}
        description={t(
          "aboutDescription",
          "Your automotive companion — browse makes, decode VINs, compare models."
        )}
        developerLabel={t("aboutDeveloper", "Developer")}
        contactLabel={t("aboutContact", "Contact")}
        closeLabel={t("aboutClose", "Close")}
        onClose={() => setShowAbout(false)}
      />
    </ScreenContainer>
  );
};

export default SettingsScreen;
