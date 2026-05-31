import React from "react";
import { TouchableOpacity, Text } from "react-native";

import { createGlobalStyles } from "@/constants/GlobalStyles";

import { useTheme } from "../context/ThemeContext";

interface ButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
}

const CustomButton: React.FC<ButtonProps> = ({ title, onPress, color }) => {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);

  return (
    <TouchableOpacity
      style={[styles.button, color ? { backgroundColor: color } : null]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
