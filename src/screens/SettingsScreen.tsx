import React from "react";
import {
  View,
  Text,
  Switch,
  ImageBackground,
  Linking,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";

import {
  createGlobalStyles,
  createHomeScreenStyles,
} from "@/constants/GlobalStyles";

import { useTheme } from "../context/ThemeContext";
import { useAppLanguage } from "../context/LanguageContext";
import ReusableModalSelector from "../components/ReusableModalSelector";
import { APP_CONFIG } from "../config/apiConfig";
import { IMAGES } from "../constants/Assets";

const SettingsScreen = () => {
  const { t } = useTranslation();

  const { language, setLanguage } = useAppLanguage();
  const { theme, toggleTheme } = useTheme();
  const styles = createGlobalStyles(theme);
  const homeStyles = createHomeScreenStyles(theme);

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
    <ImageBackground source={IMAGES.BACKGROUND} style={styles.background}>
      <View style={homeStyles.container}>
        <Text style={styles.title}>{t("settings")}</Text>
        <View style={styles.settingRow}>
          <Text style={styles.buttonText}>{t("darkMode")}</Text>
          <Switch value={theme === "dark"} onValueChange={toggleTheme} />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.buttonText}>{t("language")}</Text>
          <ReusableModalSelector
            label={t("selectLanguage")}
            data={languageOptions}
            selectedValue={language}
            onValueChange={setLanguage}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.buttonText}>{t("appVersion")}:</Text>
          <Text style={styles.buttonText}>{APP_CONFIG.VERSION}</Text>
        </View>
        <View style={[styles.card, { marginTop: 40, alignItems: "center" }]}>
          <Text style={styles.buttonText}>
            {t("aboutDeveloper")} {APP_CONFIG.DEVELOPER}
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL(APP_CONFIG.PORTFOLIO_URL)}
          >
            <Text
              style={[
                styles.buttonText,
                { color: "lightblue", textDecorationLine: "underline" },
              ]}
            >
              {t("contact")}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.buttonText, { fontSize: 12, marginTop: 10 }]}>
            {APP_CONFIG.COPYRIGHT}
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

export default SettingsScreen;
