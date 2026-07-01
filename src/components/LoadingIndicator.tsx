import React from "react";
import { View } from "react-native";
import LottieView from "lottie-react-native";

import { createGlobalStyles } from "@/constants/GlobalStyles";

import { useTheme } from "../context/ThemeContext";
import { ANIMATIONS } from "../constants/Assets";

type LoaderType = "LOADING" | "CAR" | "CARCHECK" | "EXPLORE" | "QUIZLOADING" | "THINKING";

interface LoadingIndicatorProps {
  type?: LoaderType;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  type = "LOADING",
}) => {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);

  return (
    <View style={styles.loader}>
      <LottieView
        source={ANIMATIONS[type]}
        autoPlay
        loop
        style={styles.animation}
      />
    </View>
  );
};

export default LoadingIndicator;
