import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { createGlobalStyles } from "@/constants/GlobalStyles";
import { Colors } from "@/constants/Colors";

import { useTheme } from "../context/ThemeContext";

interface QuizQuestionProps {
  question: string;
  options: string[];
  onAnswer: (selectedOption: string) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  options,
  onAnswer,
}) => {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);

  return (
    <View style={styles.quizContainer}>
      <Text style={styles.subtitle}>{question}</Text>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.option, { backgroundColor: Colors[theme].tint }]}
          onPress={() => onAnswer(option)}
        >
          <Text style={styles.buttonText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default QuizQuestion;
