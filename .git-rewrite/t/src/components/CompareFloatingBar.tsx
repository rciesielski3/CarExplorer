import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { createGlobalStyles } from "@/constants/GlobalStyles";

import { useCompare } from "../context/CompareContext";
import { useTheme } from "../context/ThemeContext";
import { RootStackParamList } from "../navigation/types";

const CompareFloatingBar = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { compareList } = useCompare();

  if (compareList.length < 2) {
    return null;
  }

  return (
    <View
      style={[
        styles.compareFloatingBar,
        { bottom: Math.max(insets.bottom, 12) + 82 },
      ]}
    >
      <Text style={styles.compareFloatingText}>
        {t("compareSelectedCount", "{{count}} selected", {
          count: compareList.length,
        })}
      </Text>
      <TouchableOpacity
        accessibilityRole="button"
        style={styles.compareFloatingButton}
        onPress={() => navigation.navigate("Compare")}
      >
        <Text style={styles.compareFloatingButtonText}>
          {t("compare", "Compare")}
        </Text>
        <Ionicons
          name="arrow-forward"
          size={16}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
};

export default CompareFloatingBar;
