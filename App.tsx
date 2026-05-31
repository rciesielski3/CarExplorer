import React from "react";
import {
  SafeAreaView,
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { FavoritesProvider } from "./src/context/FavoritesContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { LanguageProvider } from "./src/context/LanguageContext";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import "./i18n";

SplashScreen.preventAutoHideAsync();

const AppContent = () => {
  const { theme } = useTheme() || { theme: "light" };

  const [fontsLoaded] = useFonts({
    PoetsenOne: require("./assets/fonts/PoetsenOne-Regular.ttf"),
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#000" />;
  }

  return (
    <ImageBackground
      source={require("./assets/images/background.png")}
      style={[styles.background, theme === "dark" ? styles.dark : styles.light]}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <AppNavigator />
      </SafeAreaView>
    </ImageBackground>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <FavoritesProvider>
          <AppContent />
        </FavoritesProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  light: {
    backgroundColor: "#ffffff",
  },
  dark: {
    backgroundColor: "#121212",
  },
});
