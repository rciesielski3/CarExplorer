import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { createGlobalStyles } from "@/constants/GlobalStyles";
import { Colors } from "@/constants/Colors";

import { useCompare, CompareCar } from "../context/CompareContext";
import { useTheme } from "../context/ThemeContext";
import { ScreenContainer } from "../components";
import { RootStackParamList } from "../navigation/types";

type SpecRow = {
  labelKey: string;
  fallback: string;
  getValue: (car: CompareCar) => string | null | undefined;
};

const SPEC_ROWS: SpecRow[] = [
  {
    labelKey: "make",
    fallback: "Make",
    getValue: (car) => car.make,
  },
  {
    labelKey: "model",
    fallback: "Model",
    getValue: (car) => car.model,
  },
  {
    labelKey: "modelYear",
    fallback: "Model Year",
    getValue: (car) => car.year,
  },
  {
    labelKey: "vehicleType",
    fallback: "Vehicle Type",
    getValue: (car) => car.vehicleType,
  },
  {
    labelKey: "comparePower",
    fallback: "Power",
    getValue: () => null,
  },
  {
    labelKey: "compareTorque",
    fallback: "Torque",
    getValue: () => null,
  },
  {
    labelKey: "compareAcceleration",
    fallback: "Acceleration",
    getValue: () => null,
  },
  {
    labelKey: "compareDrive",
    fallback: "Drive",
    getValue: () => null,
  },
  {
    labelKey: "compareWeight",
    fallback: "Weight",
    getValue: () => null,
  },
  {
    labelKey: "compareEngine",
    fallback: "Engine",
    getValue: () => null,
  },
];

const CompareScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { compareList, resetCompare, removeFromCompare } = useCompare();

  const hasFullComparison = compareList.length === 2;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.compareContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t("back", "Back")}
          style={styles.compareBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={18} color={Colors[theme].text} />
          <Text style={styles.compareBackText}>{t("back", "Back")}</Text>
        </TouchableOpacity>

        <Text style={styles.compareEyebrow}>
          {t("compareEyebrow", "Side by side")}
        </Text>
        <Text style={styles.title}>{t("compare", "Compare")}</Text>

        {!hasFullComparison ? (
          <View style={styles.compareEmptyCard}>
            <Ionicons
              name="bar-chart-outline"
              size={36}
              color={Colors[theme].accent}
            />
            <Text style={styles.compareEmptyTitle}>
              {t("compareEmptyTitle", "Pick two cars")}
            </Text>
            <Text style={styles.compareEmptyText}>
              {t(
                "compareEmptyHint",
                "Select up to 2 models from Explore or Garage to compare them here."
              )}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.comparePrimaryButton}
              onPress={() =>
                navigation.navigate("MainTabs", { screen: "Explore" })
              }
            >
              <Text style={styles.comparePrimaryButtonText}>
                {t("comparePickCars", "Pick cars to compare")}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.compareHeaderGrid}>
              {compareList.map((car) => (
                <View key={`${car.make}-${car.model}`} style={styles.compareCarHeader}>
                  <Text style={styles.compareCarMake}>{car.make}</Text>
                  <Text style={styles.compareCarModel}>{car.model}</Text>
                  <TouchableOpacity
                    accessibilityRole="button"
                    style={styles.compareRemoveButton}
                    onPress={() => removeFromCompare(car)}
                  >
                    <Ionicons
                      name="close"
                      size={16}
                      color={Colors[theme].text}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {SPEC_ROWS.map((row) => (
              <View key={row.labelKey} style={styles.compareRow}>
                <Text style={styles.compareRowLabel}>
                  {t(row.labelKey, row.fallback)}
                </Text>
                <View style={styles.compareValueGrid}>
                  {compareList.map((car) => (
                    <View
                      key={`${row.labelKey}-${car.make}-${car.model}`}
                      style={styles.compareValueCell}
                    >
                      <Text style={styles.compareValueText}>
                        {row.getValue(car) || "—"}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            <TouchableOpacity
              accessibilityRole="button"
              style={styles.compareGhostButton}
              onPress={resetCompare}
            >
              <Text style={styles.compareGhostButtonText}>
                {t("compareClear", "Clear comparison")}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

export default CompareScreen;
