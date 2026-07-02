import React from "react";
import { View, Text } from "react-native";

import { createGlobalStyles } from "@/constants/GlobalStyles";

import { useTheme } from "../context/ThemeContext";

interface ErrorProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorProps> = ({ message }) => {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);

  if (!message) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
};

export default ErrorMessage;
