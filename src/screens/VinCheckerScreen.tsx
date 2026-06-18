import React from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import {
  createGlobalStyles,
  createHomeScreenStyles,
} from "@/constants/GlobalStyles";
import { Colors } from "@/constants/Colors";

import { decodeVin } from "../api/nhtsaApi";
import { useTheme } from "../context/ThemeContext";
import {
  CustomButton,
  ErrorMessage,
  LoadingIndicator,
  ScreenContainer,
} from "../components";
import {
  getVinValidationMessage,
  normalizeVin,
  validateVin,
} from "../utils/vinUtils";

interface VehicleData {
  Make: string;
  Manufacturer: string;
  Model: string;
  ModelYear: string;
  VehicleType: string;
}

const VinCheckerScreen = () => {
  const [vin, setVin] = React.useState("");
  const [vehicleData, setVehicleData] = React.useState<VehicleData | null>(
    null
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const { t } = useTranslation();
  const { theme } = useTheme();

  const styles = createGlobalStyles(theme);
  const stylesHome = createHomeScreenStyles(theme);

  const getValidData = (value: string | undefined): string =>
    !value || value.trim().toLowerCase() === "unknown" ? t("noData") : value;

  const translationKeyMap: Record<keyof VehicleData, string> = {
    Make: "make",
    Manufacturer: "manufacturer",
    Model: "model",
    ModelYear: "modelYear",
    VehicleType: "vehicleType",
  };

  const handleVinChange = (value: string) => {
    setVin(value);
    setError("");
  };

  const handleCheckVin = async () => {
    const validation = validateVin(vin);
    setVin(validation.normalizedVin);

    if (!validation.isValid) {
      setError(
        t(
          validation.reason
            ? getVinValidationMessage(validation.reason)
            : "vinError"
        )
      );
      setVehicleData(null);
      return;
    }

    setVehicleData(null);
    setLoading(true);
    setError("");

    try {
      const data = await decodeVin(validation.normalizedVin);
      if (!data || Object.keys(data).length === 0) {
        setError(t("noResultsFound"));
      } else {
        setVehicleData({
          Make: getValidData(data.Make),
          Manufacturer: getValidData(data.Manufacturer),
          Model: getValidData(data.Model),
          ModelYear: getValidData(data.ModelYear),
          VehicleType: getValidData(data.VehicleType),
        });
      }
    } catch {
      setError(t("errorFetchingData"));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setVin("");
    setVehicleData(null);
    setError("");
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={[
          stylesHome.scrollContent,
          !vehicleData && !loading && styles.centeredContent,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.vinHero}>
          <LoadingIndicator type="CARCHECK" />
          <Text style={styles.title}>{t("vinCheckerTitle")}</Text>
          <Text style={styles.vinHint}>{t("vinCheckerSubtitle")}</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder={t("enterVin")}
          placeholderTextColor={Colors[theme].tabIconDefault}
          value={vin}
          onChangeText={handleVinChange}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <Text style={styles.vinCounter}>
          {normalizeVin(vin).length}/17 · {t("vinFormatHint")}
        </Text>
        <View style={styles.buttonContainer}>
          <CustomButton
            title={t("check")}
            onPress={handleCheckVin}
            color={Colors[theme].ok}
          />
          <CustomButton
            title={t("clear")}
            onPress={handleClear}
            color={Colors[theme].tabIconSelected}
          />
        </View>
        {loading && <LoadingIndicator />}
        {error && <ErrorMessage message={error} />}
        {vehicleData && !error && (
          <View style={styles.vinResultsContainer}>
            <View style={styles.vinResultHeader}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={Colors[theme].ok}
              />
              <Text style={styles.subtitle}>{t("vinResultTitle")}</Text>
            </View>
            {Object.entries(vehicleData).map(([key, value]) => (
              <View key={key} style={styles.vinResultRow}>
                <Text style={styles.vinResultLabel}>
                  {t(translationKeyMap[key as keyof VehicleData])}
                </Text>
                <Text style={styles.vinResultValue}>{value}</Text>
              </View>
            ))}
            <View style={styles.vinNextStep}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={Colors[theme].tabIconSelected}
              />
              <Text style={styles.vinNextStepText}>{t("vinNextStepHint")}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

export default VinCheckerScreen;
