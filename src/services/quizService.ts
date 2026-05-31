import axios from "axios";

import { QUIZ_API } from "../config/apiConfig";
import { translateQuestions } from "../services/translateService";

interface Question {
  question: string;
  options: string[];
  answer: string;
}

/**
 * Shuffle an array randomly.
 */
const shuffleArray = (array: string[]): string[] =>
  array.sort(() => Math.random() - 0.5);

/**
 * Fetch quiz questions from Open Trivia DB.
 */
export const fetchQuizQuestions = async (
  language: string
): Promise<Question[]> => {
  try {
    const response = await axios.get(
      `${QUIZ_API.BASE_URL}${QUIZ_API.DEFAULT_PARAMS}`
    );

    if (!response.data.results || response.data.results.length === 0) {
      console.warn("⚠️ No quiz questions available.");
      return [];
    }

    const formattedQuestions = response.data.results.map((q: any) => ({
      question: q.question,
      options: shuffleArray([...q.incorrect_answers, q.correct_answer]),
      answer: q.correct_answer,
    }));

    return language !== "en"
      ? await translateQuestions(formattedQuestions, language)
      : formattedQuestions;
  } catch (error) {
    console.error("❌ Error fetching quiz questions:", error);
    return [];
  }
};
