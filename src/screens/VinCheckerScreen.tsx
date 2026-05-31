import React from "react";
import { View, Text, TextInput, ImageBackground } from "react-native";
import { useTranslation } from "react-i18next";

import {
  createGlobalStyles,
  createHomeScreenStyles,
} from "@/constants/GlobalStyles";
import { Colors } from "@/constants/Colors";

import { decodeVin } from "../api/nhtsaApi";
import { useTheme } from "../context/ThemeContext";
import { CustomButton, ErrorMessage, LoadingIndicator } from "../components";
import { IMAGES } from "../constants/Assets";

interface VehicleData {
  Make: string;
  Manufacturer: string;
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
    ModelYear: "modelYear",
    VehicleType: "vehicleType",
  };

  const handleCheckVin = async () => {
    if (!vin.trim()) {
      setError(t("vinError"));
      return;
    }
    handleClear();
    setLoading(true);
    setError("");

    try {
      const data = await decodeVin(vin);
      if (!data || Object.keys(data).length === 0) {
        setError(t("noResultsFound"));
      } else {
        setVehicleData({
          Make: getValidData(data.Make),
          Manufacturer: getValidData(data.Manufacturer),
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
    <ImageBackground source={IMAGES.BACKGROUND} style={styles.background}>
      <View style={stylesHome.container}>
        <View style={[stylesHome.buttonContainer, { marginBottom: "20%" }]}>
          <LoadingIndicator type="CARCHECK" />
        </View>
        <Text style={styles.title}>{t("vinCheckerTitle")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("enterVin")}
          placeholderTextColor={Colors[theme].tabIconDefault}
          value={vin}
          onChangeText={setVin}
          autoCapitalize="characters"
        />
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
          <View style={styles.resultsContainer}>
            {Object.entries(vehicleData).map(([key, value]) => (
              <View key={key} style={styles.resultsRow}>
                <Text style={styles.description}>
                  {t(translationKeyMap[key as keyof VehicleData])}:
                </Text>
                <Text style={styles.resultText}>{value}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

export default VinCheckerScreen;
