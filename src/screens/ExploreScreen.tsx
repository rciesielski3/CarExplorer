import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";

import {
  createGlobalStyles,
  createHomeScreenStyles,
} from "@/constants/GlobalStyles";
import { Colors } from "@/constants/Colors";

import {
  fetchModelsForMake,
  fetchModelsForMakeAndYear,
  fetchModelsForMakeAndType,
} from "../api/nhtsaApi";
import {
  CompareFloatingBar,
  CustomButton,
  ErrorMessage,
  LoadingIndicator,
  ScreenContainer,
} from "../components";
import CarCard from "../components/CarCard";
import ReusableModalSelector from "../components/ReusableModalSelector";
import { fetchCarLogos } from "../services/carLogoService";
import { useTheme } from "../context/ThemeContext";
import { POPULAR_CAR_MAKES } from "../../constants/carMakes";

interface CarModel {
  id: number;
  name: string;
}

const screenWidth = Dimensions.get("window").width;
const numColumns = screenWidth < 400 ? 2 : 3;

const ExploreScreen = () => {
  const [selectedMake, setSelectedMake] = React.useState<string | null>(null);
  const [models, setModels] = React.useState<CarModel[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loadingLogos, setLoadingLogos] = React.useState(false);
  const [modelYear, setModelYear] = React.useState<string | null>(null);
  const [vehicleType, setVehicleType] = React.useState<string | null>(null);
  const [logos, setLogos] = React.useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const { t } = useTranslation();

  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);
  const stylesHome = createHomeScreenStyles(theme);

  const MODEL_YEARS = Array.from({ length: 30 }, (_, i) => `${2025 - i}`);
  const VEHICLE_TYPES = [
    { key: "Car", label: "🚗  " + t("car"), value: "Car" },
    { key: "Truck", label: "🚚  " + t("truck"), value: "Truck" },
    { key: "Bus", label: "🚌  " + t("bus"), value: "Bus" },
    { key: "Motorcycle", label: "🏍️  " + t("motorcycle"), value: "Motorcycle" },
  ];

  useFocusEffect(
    React.useCallback(() => {
      setSelectedMake(null);
      setModelYear(null);
      setVehicleType(null);
      setModels([]);
      setErrorMessage(null);
    }, [])
  );

  const fetchModels = React.useCallback(async () => {
    if (!selectedMake) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      let modelData: CarModel[] = [];

      if (modelYear && vehicleType) {
        const [byYear, byType] = await Promise.all([
          fetchModelsForMakeAndYear(selectedMake, Number(modelYear)),
          fetchModelsForMakeAndType(selectedMake, vehicleType),
        ]);
        modelData = [...byYear, ...byType];
      } else if (modelYear) {
        modelData = await fetchModelsForMakeAndYear(
          selectedMake,
          Number(modelYear)
        );
      } else if (vehicleType) {
        modelData = await fetchModelsForMakeAndType(selectedMake, vehicleType);
      } else {
        modelData = await fetchModelsForMake(selectedMake);
      }

      if (modelData.length === 0) {
        setErrorMessage(t("noModelsFound"));
      }

      setModels(modelData);
    } catch (error) {
      console.error("Error fetching models:", error);
      setErrorMessage(t("errorFetchingData"));
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMake, modelYear, vehicleType, t]);

  const resetFilters = () => {
    setModelYear(null);
    setVehicleType(null);
  };

  const handleSelectMake = (make: string) => {
    setModelYear(null);
    setVehicleType(null);
    setErrorMessage(null);
    setSelectedMake(make);
  };

  const handleBackToMakes = () => {
    setSelectedMake(null);
    setModelYear(null);
    setVehicleType(null);
    setModels([]);
    setErrorMessage(null);
  };

  React.useEffect(() => {
    if (selectedMake) {
      fetchModels();
    }
  }, [selectedMake, fetchModels]);

  React.useEffect(() => {
    const loadLogos = async () => {
      setLoadingLogos(true);
      try {
        const fetchedLogos = await fetchCarLogos();
        setLogos(fetchedLogos);
      } catch (error) {
        console.error("Error fetching logos:", error);
      } finally {
        setLoadingLogos(false);
      }
    };
    loadLogos();
  }, []);

  return (
    <ScreenContainer>
      <View style={stylesHome.container}>
        <Text style={styles.title}>{selectedMake || t("exploreCars")}</Text>
        <Text style={stylesHome.subtitle}>
          {selectedMake ? t("selectVehicleType") : t("quickExploreSubtitle")}
        </Text>
        {loadingLogos ? (
          <LoadingIndicator />
        ) : !selectedMake ? (
          <FlatList
            data={POPULAR_CAR_MAKES}
            keyExtractor={(item) => item}
            numColumns={numColumns}
            style={styles.flexFill}
            contentContainerStyle={styles.makesContainer}
            renderItem={({ item }) => {
              const logoUrl = logos[item] || logos[item.toLowerCase()] || null;
              return (
                <TouchableOpacity
                  style={styles.makeButton}
                  onPress={() => handleSelectMake(item)}
                >
                  {logoUrl ? (
                    <Image source={{ uri: logoUrl }} style={styles.logo} />
                  ) : (
                    <Text style={styles.makeAbbreviationText}>
                      {item.slice(0, 3).toUpperCase()}
                    </Text>
                  )}
                  <Text style={styles.makeButtonText}>{item}</Text>
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <>
            <View
              style={[
                styles.settingRow,
                {
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginVertical: 10,
                },
              ]}
            >
              <ReusableModalSelector
                label={t("selectModelYear")}
                data={MODEL_YEARS.map((year) => ({
                  key: year,
                  label: year,
                  value: year,
                }))}
                selectedValue={modelYear}
                onValueChange={setModelYear}
              />
              <ReusableModalSelector
                label={t("selectVehicleType")}
                data={VEHICLE_TYPES}
                selectedValue={vehicleType}
                onValueChange={setVehicleType}
              />
            </View>
            <View style={styles.buttonContainer}>
              <CustomButton
                title={t("applyFilters")}
                onPress={fetchModels}
                color={Colors[theme].ok}
              />
              <CustomButton
                title={t("resetFilters")}
                onPress={resetFilters}
                color={Colors[theme].not}
              />
            </View>
            {loading ? (
              <LoadingIndicator />
            ) : errorMessage ? (
              <ErrorMessage message={errorMessage} />
            ) : (
              <FlatList
                data={models}
                keyExtractor={(item) => item.id.toString()}
                style={styles.flexFill}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <CarCard
                    make={selectedMake!}
                    model={item.name}
                    showCompare
                    compareCar={{
                      make: selectedMake!,
                      model: item.name,
                      year: modelYear,
                      vehicleType,
                    }}
                  />
                )}
              />
            )}
            <View style={[stylesHome.buttonContainer, { marginTop: 4 }]}>
              <TouchableOpacity
                style={[
                  stylesHome.button,
                  { backgroundColor: Colors[theme].surfaceMuted },
                ]}
                onPress={handleBackToMakes}
              >
                <Text
                  style={[
                    stylesHome.buttonText,
                    { color: Colors[theme].tabIconSelected },
                  ]}
                >
                  {t("backToMakes")}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      <CompareFloatingBar />
    </ScreenContainer>
  );
};

export default ExploreScreen;
