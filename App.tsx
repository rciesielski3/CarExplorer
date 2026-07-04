import React from "react";
import { StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AppNavigator from "./src/navigation/AppNavigator";
import { Colors } from "./constants/Colors";
import { CompareProvider } from "./src/context/CompareContext";
import { FavoritesProvider } from "./src/context/FavoritesContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { LanguageProvider } from "./src/context/LanguageContext";
import { PremiumProvider } from "./src/context/PremiumContext";
import { SettingsProvider } from "./src/context/SettingsContext";
import { useFonts } from "expo-font";
import {
  BarlowCondensed_700Bold,
  BarlowCondensed_800ExtraBold,
  BarlowCondensed_900Black,
} from "@expo-google-fonts/barlow-condensed";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import * as SplashScreen from "expo-splash-screen";
import { perfMonitor } from "./src/utils/performanceMonitor";
import "./i18n";

SplashScreen.preventAutoHideAsync();

const DeferredProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <FavoritesProvider>
      {children}
    </FavoritesProvider>
  );
};

const AppContent = () => {
  const { theme } = useTheme() || { theme: "light" };

  const [fontsLoaded] = useFonts({
    PoetsenOne: require("./assets/fonts/PoetsenOne-Regular.ttf"),
    BarlowCondensed_700Bold,
    BarlowCondensed_800ExtraBold,
    BarlowCondensed_900Black,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });

  // Track font loading performance on mount
  React.useEffect(() => {
    perfMonitor.startMeasure("font-load");
  }, []);

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      perfMonitor.endMeasure("font-load");
      // Log performance metrics (development/debugging)
      perfMonitor.logMetrics();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#000" />;
  }

  return (
    <LinearGradient
      colors={Colors[theme].gradient as [string, string, ...string[]]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.background}
    >
      <AppNavigator />
    </LinearGradient>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <CompareProvider>
          <PremiumProvider>
            <SettingsProvider>
              <DeferredProviders>
                <AppContent />
              </DeferredProviders>
            </SettingsProvider>
          </PremiumProvider>
        </CompareProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});
