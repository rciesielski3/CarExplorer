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
import { useSettings } from "../context/SettingsContext";
import { AdBanner, CustomButton, ScreenContainer, SpecRange, ErrorBoundary } from "../components";
import { RootStackParamList } from "../navigation/types";
import {
  convertPower,
  convertWeight,
  convertSpeed,
} from "../utils/unitConverter";

type SpecRow = {
  labelKey: string;
  fallback: string;
  getValue: (car: CompareCar, isImperial?: boolean) => string | string[] | null | undefined;
  isArray?: boolean;
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
    labelKey: "compareEngine",
    fallback: "Engine",
    getValue: (car, imperial) =>
      car.specifications?.engine?.length ? car.specifications.engine : null,
    isArray: true,
  },
  {
    labelKey: "comparePower",
    fallback: "Power",
    getValue: (car, imperial) => {
      if (!car.specifications?.power || car.specifications.power.length === 0) {
        return null;
      }
      return car.specifications.power
        .map(p => {
          const kwMatch = p.match(/(\d+(?:\.\d+)?)\s*kW/);
          if (kwMatch) {
            const kw = parseFloat(kwMatch[1]);
            return convertPower(kw, imperial || false);
          }
          return p;
        });
    },
    isArray: true,
  },
  {
    labelKey: "compareTorque",
    fallback: "Torque",
    getValue: (car) =>
      car.specifications?.torque?.length
        ? car.specifications.torque
        : null,
    isArray: true,
  },
  {
    labelKey: "compareAcceleration",
    fallback: "Acceleration (0-100)",
    getValue: (car) =>
      car.specifications?.acceleration?.length
        ? car.specifications.acceleration
        : null,
    isArray: true,
  },
  {
    labelKey: "compareWeight",
    fallback: "Weight",
    getValue: (car, imperial) => {
      if (!car.specifications?.weight || car.specifications.weight.length === 0) {
        return null;
      }
      return car.specifications.weight
        .map(w => {
          const kgMatch = w.match(/(\d+(?:\.\d+)?)\s*kg/);
          if (kgMatch) {
            const kg = parseFloat(kgMatch[1]);
            return convertWeight(kg, imperial || false);
          }
          return w;
        });
    },
    isArray: true,
  },
  {
    labelKey: "compareDimensions",
    fallback: "Dimensions",
    getValue: (car) =>
      car.specifications?.dimensions?.length
        ? car.specifications.dimensions
        : null,
    isArray: true,
  },
  {
    labelKey: "compareFuelType",
    fallback: "Fuel Type",
    getValue: (car) =>
      car.specifications?.fuelType?.length
        ? car.specifications.fuelType
        : null,
    isArray: true,
  },
  {
    labelKey: "compareTransmission",
    fallback: "Transmission",
    getValue: (car) =>
      car.specifications?.transmission?.length
        ? car.specifications.transmission
        : null,
    isArray: true,
  },
  {
    labelKey: "compareTopSpeed",
    fallback: "Top Speed",
    getValue: (car, imperial) => {
      if (!car.specifications?.topSpeed || car.specifications.topSpeed.length === 0) {
        return null;
      }
      return car.specifications.topSpeed
        .map(s => {
          const kmhMatch = s.match(/(\d+(?:\.\d+)?)\s*km\/h/);
          if (kmhMatch) {
            const kmh = parseFloat(kmhMatch[1]);
            return convertSpeed(kmh, imperial || false);
          }
          return s;
        });
    },
    isArray: true,
  },
];

const CompareScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { compareList, resetCompare, removeFromCompare } = useCompare();
  const { settings } = useSettings();
  const isImperial = settings.preferredUnitSystem === "imperial";

  const hasFullComparison = compareList.length === 2;

  return (
    <ErrorBoundary apiName="Compare">
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
          <View style={styles.compareEmptyStateWrapper}>
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
              <CustomButton
                title={t("comparePickCars", "Pick cars to compare")}
                onPress={() =>
                  navigation.navigate("MainTabs", { screen: "Explore" })
                }
              />
            </View>
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
                  {compareList.map((car) => {
                    const value = row.getValue(car, isImperial);
                    return (
                      <View
                        key={`${row.labelKey}-${car.make}-${car.model}`}
                        style={styles.compareValueCell}
                      >
                        {Array.isArray(value) ? (
                          <SpecRange
                            values={value}
                            fallback="—"
                          />
                        ) : (
                          <Text style={styles.compareValueText}>
                            {value || "—"}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}

            <View style={styles.stickyFooter}>
              <CustomButton
                title={t("compareClear", "Clear comparison")}
                onPress={resetCompare}
                variant="secondary"
              />
            </View>
          </>
        )}
        </ScrollView>
        <AdBanner />
      </ScreenContainer>
    </ErrorBoundary>
  );
};

export default CompareScreen;
