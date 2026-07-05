import { QUIZ_API } from "../config/apiConfig";
import { handleApiError } from "../utils/errorHandler";
import { toastManager } from "../components/Toast";

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface OpenTriviaResponse {
  response_code: number;
  results: Array<{
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
  }>;
}

/**
 * Shuffle an array randomly.
 */
const shuffleArray = (array: string[]): string[] =>
  array.sort(() => Math.random() - 0.5);

/**
 * Format raw quiz question data into QuizQuestion format.
 */
const formatQuestions = (
  results: OpenTriviaResponse["results"]
): QuizQuestion[] => {
  return results.map((q) => ({
    question: q.question,
    options: shuffleArray([...q.incorrect_answers, q.correct_answer]),
    answer: q.correct_answer,
  }));
};

/**
 * Fetch quiz questions from Open Trivia DB API.
 * Returns empty array on error with user-friendly toast notification.
 */
export const getQuizQuestions = async (): Promise<QuizQuestion[]> => {
  try {
    const url = `${QUIZ_API.BASE_URL}${QUIZ_API.DEFAULT_PARAMS}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = new Response(null, { status: response.status });
      const result = handleApiError(error, {
        apiName: "Quiz",
        action: "fetch_questions",
      });
      toastManager.show(result.message, "error");
      console.warn("[QUIZ_ERROR]", result.context);
      return [];
    }

    const data: OpenTriviaResponse = await response.json();

    if (!data.results || data.results.length === 0) {
      console.warn("No quiz questions available");
      return [];
    }

    return formatQuestions(data.results);
  } catch (error) {
    const errorToThrow =
      error instanceof Error ? error : new Error(String(error));
    const result = handleApiError(errorToThrow, {
      apiName: "Quiz",
      action: "fetch_questions",
    });
    toastManager.show(result.message, "error");
    console.warn("[QUIZ_ERROR]", result.context);
    return [];
  }
};
