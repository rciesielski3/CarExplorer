import axios from "axios";

import { GOOGLE_TRANSLATE_API } from "../config/apiConfig";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

// Note: i18next is initialized once, app-wide, in `i18n.ts` (imported from
// App.tsx). This module only calls the Google Translate API directly and
// does not use i18next, so it must not re-initialize the shared i18next
// singleton — doing so previously crashed whenever react-i18next was mocked
// (e.g. in tests) because `initReactI18next` would resolve to undefined.

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
