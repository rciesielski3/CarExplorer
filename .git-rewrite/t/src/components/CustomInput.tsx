import React from "react";
import { TextInput } from "react-native";

import { createGlobalStyles } from "@/constants/GlobalStyles";
import { Colors } from "@/constants/Colors";

import { useTheme } from "../context/ThemeContext";

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

const CustomInput: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
}) => {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);

  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={Colors[theme].tabIconDefault}
      value={value}
      onChangeText={onChangeText}
    />
  );
};

export default CustomInput;
