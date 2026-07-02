import { useEffect, useState } from "react";

import { fetchQuizQuestions } from "../services/quizService";

interface Question {
  question: string;
  options: string[];
  answer: string;
}

export const useFetchQuiz = (language: string) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      const fetchedQuestions = await fetchQuizQuestions(language);
      setQuestions(fetchedQuestions);
      setLoading(false);
    };

    loadQuestions();
  }, [language]);

  return { questions, loading };
};
