import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import translation files
import en from "./locales/en.json";
import de from "./locales/de.json";
import pl from "./locales/pl.json";
import fr from "./locales/fr.json";

const SUPPORTED_LANGUAGES = ["en", "de", "pl", "fr"];

const getStoredLanguage = async () => {
  const storedLang = await AsyncStorage.getItem("appLanguage");
  return storedLang && SUPPORTED_LANGUAGES.includes(storedLang)
    ? storedLang
    : "en";
};

// Initialize i18next
i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    de: { translation: de },
    pl: { translation: pl },
    fr: { translation: fr },
  },
  lng: "en", // Default language
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Load stored language
getStoredLanguage().then((lng) => {
  i18next.changeLanguage(lng);
});

export default i18next;
