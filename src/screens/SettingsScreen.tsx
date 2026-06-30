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
import { usePremium } from "../context/PremiumContext";
import { useSettings } from "../context/SettingsContext";
import ReusableModalSelector from "../components/ReusableModalSelector";
import { AboutModal, ConfirmModal, ScreenContainer } from "../components";
import { useFavorites } from "../context/FavoritesContext";
import { useCompare } from "../context/CompareContext";
import { Colors } from "@/constants/Colors";

const SettingsScreen = () => {
  const { t } = useTranslation();

  const { language, setLanguage } = useAppLanguage();
  const { theme, toggleTheme } = useTheme();
  const { isPremium, setIsPremium } = usePremium();
  const { clearFavorites } = useFavorites();
  const { resetCompare } = useCompare();
  const { settings, setPreferredUnitSystem } = useSettings();
  const styles = createGlobalStyles(theme);
  const homeStyles = createHomeScreenStyles(theme);
  const [showAbout, setShowAbout] = React.useState(false);
  const [showResetModal, setShowResetModal] = React.useState(false);
  const [resetSuccess, setResetSuccess] = React.useState(false);
  const [showClearFavoritesModal, setShowClearFavoritesModal] = React.useState(false);
  const [clearFavoritesSuccess, setClearFavoritesSuccess] = React.useState(false);

  const handleReset = () => {
    clearFavorites();
    resetCompare();
    setShowResetModal(false);
    setResetSuccess(true);
  };

  const handleClearFavorites = () => {
    clearFavorites();
    resetCompare();
    setShowClearFavoritesModal(false);
    setClearFavoritesSuccess(true);
    setTimeout(() => setClearFavoritesSuccess(false), 3000);
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
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>
            {t('unitSystem', 'Unit System')}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={[
                styles.unitButton,
                settings.preferredUnitSystem === 'metric' && styles.unitButtonActive,
              ]}
              onPress={() => setPreferredUnitSystem('metric')}
            >
              <Text style={styles.unitButtonText}>Metric</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unitButton,
                settings.preferredUnitSystem === 'imperial' && styles.unitButtonActive,
              ]}
              onPress={() => setPreferredUnitSystem('imperial')}
            >
              <Text style={styles.unitButtonText}>Imperial</Text>
            </TouchableOpacity>
          </View>
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
          onPress={() => setShowClearFavoritesModal(true)}
        >
          <Text style={styles.settingLabel}>
            {t("clearFavorites", "Clear Favorites & Garage")}
          </Text>
          <Ionicons
            name="trash-outline"
            size={18}
            color={Colors[theme].icon}
          />
        </TouchableOpacity>
        {clearFavoritesSuccess && (
          <Text style={styles.emptyText}>
            {t("clearFavoritesSuccess", "Favorites and Garage cleared")}
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
      <ConfirmModal
        visible={showClearFavoritesModal}
        title={t("clearFavoritesTitle", "Clear Favorites & Garage")}
        message={t(
          "clearFavoritesMessage",
          "This will permanently remove all your saved favorites and garage selections. This action cannot be undone."
        )}
        cancelLabel={t("clearFavoritesCancel", "Cancel")}
        confirmLabel={t("clearFavoritesConfirm", "Clear")}
        onCancel={() => setShowClearFavoritesModal(false)}
        onConfirm={handleClearFavorites}
      />
      <AboutModal
        visible={showAbout}
        title={t("aboutTitle", "Car Explorer")}
        description={t(
          "aboutDescription",
          "Your automotive companion — browse makes, decode VINs, compare models."
        )}
        developerLabel={t("aboutDeveloper", "Developer")}
        closeLabel={t("aboutClose", "Close")}
        onClose={() => setShowAbout(false)}
      />
    </ScreenContainer>
  );
};

export default SettingsScreen;
