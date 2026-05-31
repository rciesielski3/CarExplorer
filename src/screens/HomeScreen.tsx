import React from "react";
import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  createGlobalStyles,
  createHomeScreenStyles,
} from "@/constants/GlobalStyles";
import { Colors } from "@/constants/Colors";

import { useTheme } from "../context/ThemeContext";
import { RootStackParamList } from "../navigation/types";
import { ANIMATIONS, IMAGES } from "../constants/Assets";

const HomeScreen = () => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);
  const homeStyles = createHomeScreenStyles(theme);

  const navigateTo = React.useCallback(
    (screen: "Explore" | "Quiz" | "Discover") => {
      navigation.navigate(screen);
    },
    [navigation]
  );

  return (
    <ImageBackground source={IMAGES.BACKGROUND} style={styles.background}>
      <View style={homeStyles.container}>
        <View style={homeStyles.buttonContainer}>
          <LottieView
            source={ANIMATIONS.CAR}
            autoPlay
            loop
            style={homeStyles.animation}
          />
        </View>
        <Text style={styles.title}>{t("homeTitle")}</Text>
        <View style={homeStyles.buttonContainer}>
          <NavButton
            title={t("exploreCars")}
            backgroundColor={Colors[theme].tabIconSelected}
            onPress={() => navigateTo("Explore")}
          />
          <NavButton
            title={t("takeQuiz")}
            backgroundColor={Colors[theme].ok}
            onPress={() => navigateTo("Quiz")}
          />
          <NavButton
            title={t("discover")}
            backgroundColor={Colors[theme].icon}
            onPress={() => navigateTo("Discover")}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

const NavButton = ({
  title,
  backgroundColor,
  onPress,
}: {
  title: string;
  backgroundColor: string;
  onPress: () => void;
}) => {
  const homeStyles = createHomeScreenStyles(useTheme().theme);
  return (
    <TouchableOpacity
      style={[homeStyles.button, { backgroundColor }]}
      onPress={onPress}
    >
      <Text style={homeStyles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

export default HomeScreen;
