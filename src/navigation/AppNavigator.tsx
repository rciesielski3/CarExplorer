import React from "react";
import { useTranslation } from "react-i18next";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import { useTheme } from "../context/ThemeContext";
import { RootStackParamList } from "../navigation/types";
import HomeScreen from "../screens/HomeScreen";
import ExploreScreen from "../screens/ExploreScreen";
import QuizScreen from "../screens/QuizScreen";
import DiscoverScreen from "../screens/DiscoverScreen";
import VinCheckerScreen from "../screens/VinCheckerScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import NewsScreen from "../screens/NewsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import WebViewScreen from "../screens/WebViewScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabNavigator = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          left: 18,
          right: 18,
          bottom: Math.max(insets.bottom, 12),
          minHeight: 68,
          borderRadius: 26,
          backgroundColor:
            theme === "dark" ? "rgba(10,10,11,0.96)" : "rgba(242,239,233,0.97)",
          borderTopColor: Colors[theme].border,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: Colors[theme].border,
          paddingTop: 7,
          paddingBottom: 9,
          shadowColor: Colors[theme].shadow,
          shadowOpacity: 0.24,
          shadowOffset: { width: 0, height: 12 },
          shadowRadius: 24,
          elevation: 18,
        },
        tabBarItemStyle: {
          minHeight: 48,
        },
        tabBarLabelStyle: {
          fontFamily: "DMSans_500Medium",
          fontSize: 9,
          letterSpacing: 0.7,
          textTransform: "uppercase",
        },
        tabBarActiveTintColor: Colors[theme].tabIconSelected,
        tabBarInactiveTintColor: Colors[theme].tabIconDefault,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t("home"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size + 1} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarLabel: t("explore"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" color={color} size={size + 1} />
          ),
        }}
      />
      <Tab.Screen
        name="Quiz"
        component={QuizScreen}
        options={{
          tabBarLabel: t("quiz"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bulb-outline" color={color} size={size + 1} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: t("garage", "Garage"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" color={color} size={size + 1} />
          ),
        }}
      />
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={{
          tabBarLabel: t("news"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" color={color} size={size + 1} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: Colors[theme].background },
          headerTintColor: Colors[theme].text,
          headerTitleStyle: { fontFamily: "DMSans_600SemiBold" },
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen
          name="Vin"
          component={VinCheckerScreen}
          options={{
            headerShown: true,
            title: t("vinCheckerTitle"),
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerShown: true,
            title: t("settings"),
          }}
        />
        <Stack.Screen
          name="Discover"
          component={DiscoverScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="WebViewScreen"
          component={WebViewScreen}
          options={{ headerShown: true, title: "Article" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
