import React, { createContext, useContext, ReactNode } from 'react';

interface QuizContextType {
  // Placeholder for quiz state - can be extended as needed
  quizInitialized: boolean;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QuizContext.Provider value={{ quizInitialized: true }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = (): QuizContextType => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
