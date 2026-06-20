import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";

import { useTheme } from "../context/ThemeContext";

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={Colors[theme].gradient as [string, string, ...string[]]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.fill, style]}
    >
      <View pointerEvents="none" style={styles.depthLayer}>
        <LinearGradient
          colors={["rgba(255,77,28,0.10)", "rgba(255,77,28,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.depthBand, styles.depthBandTop]}
        />
        <LinearGradient
          colors={["rgba(34,197,94,0.05)", "rgba(34,197,94,0)"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.depthBand, styles.depthBandBottom]}
        />
        <View style={styles.textureLineTop} />
        <View style={styles.textureLineBottom} />
      </View>
      <SafeAreaView style={styles.fill} edges={["top"]}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  depthLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  depthBand: {
    position: "absolute",
    width: "82%",
    height: 260,
    opacity: 0.55,
    transform: [{ rotate: "-16deg" }],
  },
  depthBandTop: {
    top: -70,
    right: -130,
  },
  depthBandBottom: {
    bottom: 90,
    left: -160,
  },
  textureLineTop: {
    position: "absolute",
    top: 118,
    right: -42,
    width: 220,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.035)",
    transform: [{ rotate: "-20deg" }],
  },
  textureLineBottom: {
    position: "absolute",
    bottom: 188,
    left: -34,
    width: 260,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
    transform: [{ rotate: "-20deg" }],
  },
});

export default ScreenContainer;
