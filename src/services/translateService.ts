import axios from "axios";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../../locales/en.json";
import fr from "../../locales/fr.json";
import de from "../../locales/de.json";
import pl from "../../locales/pl.json";

import { GOOGLE_TRANSLATE_API } from "../config/apiConfig";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    de: { translation: de },
    pl: { translation: pl },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

/**
 * Translate text using Google Translate API.
 */
const translateText = async (
  text: string,
  targetLang: string
): Promise<string> => {
  try {
    const url = `${
      GOOGLE_TRANSLATE_API.BASE_URL
    }${GOOGLE_TRANSLATE_API.QUERY_PARAMS("en", targetLang, text)}`;
    const response = await axios.get(url);
    return response.data[0][0][0];
  } catch (error) {
    console.error(
      `❌ Error translating text: "${text}" to ${targetLang}`,
      error
    );
    return text;
  }
};

/**
 * Translate quiz questions into the target language.
 */
export const translateQuestions = async (
  questions: QuizQuestion[],
  targetLang: string
): Promise<QuizQuestion[]> => {
  return Promise.all(
    questions.map(async (q) => ({
      question: await translateText(q.question, targetLang),
      options: await Promise.all(
        q.options.map((option: string) => translateText(option, targetLang))
      ),
      answer: await translateText(q.answer, targetLang),
    }))
  );
};
