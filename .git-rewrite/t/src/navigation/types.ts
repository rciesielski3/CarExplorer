import { NavigatorScreenParams } from "@react-navigation/native";

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Quiz: undefined;
  Favorites: undefined;
  News: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Home: undefined;
  Explore: undefined;
  Discover: undefined;
  Quiz: undefined;
  Compare: undefined;
  Vin: undefined;
  Favorites: undefined;
  News: undefined;
  Settings: undefined;
  WebViewScreen: { url: string };
};
