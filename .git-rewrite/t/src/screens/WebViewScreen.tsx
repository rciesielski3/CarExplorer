import React from "react";
import { View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "WebViewScreen">;

const WebViewScreen: React.FC<Props> = ({ route }) => {
  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: route.params.url }}
        startInLoadingState
        renderLoading={() => <ActivityIndicator size="large" />}
      />
    </View>
  );
};

export default WebViewScreen;
