import React from "react";
import { StyleProp, Text, TouchableOpacity, ViewStyle } from "react-native";

import { createGlobalStyles } from "@/constants/GlobalStyles";

import { useTheme } from "../context/ThemeContext";

interface ButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  variant?: "primary" | "secondary" | "danger" | "success";
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

const CustomButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  color,
  variant = "primary",
  style,
  disabled,
}) => {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);
  const isSecondary = variant === "secondary";
  const backgroundColor =
    color ||
    (variant === "danger"
      ? "#EF4444"
      : variant === "success"
        ? "#22C55E"
        : isSecondary
          ? "transparent"
          : undefined);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        backgroundColor ? { backgroundColor } : null,
        isSecondary ? styles.confirmModalCancel : null,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[styles.buttonText, isSecondary && styles.buttonSecondaryText]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
