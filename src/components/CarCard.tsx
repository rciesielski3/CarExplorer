import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  GestureResponderEvent,
} from "react-native";
import { useTranslation } from "react-i18next";

import { FontAwesome } from "@expo/vector-icons";
import { createGlobalStyles } from "@/constants/GlobalStyles";
import { Colors } from "@/constants/Colors";

import { getCarImagesFallbackUrl } from "../api/carImagesApi";
import { fetchWikipediaCarImage, getCarDetails } from "../api/wikipediaApi";
import { useAppLanguage } from "../context/LanguageContext";
import { useFavorites } from "../context/FavoritesContext";
import { CompareCar, useCompare } from "../context/CompareContext";
import { useTheme } from "../context/ThemeContext";
import LoadingIndicator from "./LoadingIndicator";
import CustomButton from "./CustomButton";

interface CarCardProps {
  make: string;
  model: string;
  year?: string | null;
  showCompare?: boolean;
  compareCar?: CompareCar;
}

const CarCard: React.FC<CarCardProps> = ({
  make,
  model,
  year,
  showCompare = false,
  compareCar,
}) => {
  const [imageUri, setImageUri] = React.useState<string | null>(null);
  const [sourceStep, setSourceStep] = React.useState<
    "wiki" | "carimages" | "fallback"
  >("wiki");
  const [loading, setLoading] = React.useState<boolean>(true);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [carDetails, setCarDetails] = React.useState<string | null>(null);
  const [detailsStatus, setDetailsStatus] = React.useState<
    "idle" | "loading" | "loaded" | "noDetails"
  >("idle");

  const { t } = useTranslation();

  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);

  const { language } = useAppLanguage();
  const activeLanguage = language || "en";
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const activeCompareCar = compareCar || { make, model };
  const isFavorite = favorites.some(
    (car) => car.make === make && car.model === model
  );
  const isCompared = isInCompare(activeCompareCar);

  const fetchCarDetails = async () => {
    setDetailsStatus("loading");
    try {
      const details = await getCarDetails(make, model, activeLanguage);
      const safeDetails = details?.trim() ? details : null;
      setCarDetails(safeDetails);
      setDetailsStatus(safeDetails ? "loaded" : "noDetails");
    } catch (error) {
      console.error("Error fetching car details:", error);
      setCarDetails(null);
      setDetailsStatus("noDetails");
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setCarDetails(null);
    setDetailsStatus("idle");
  };

  const handleCardPress = () => {
    setModalVisible(true);
    setCarDetails(null);
    fetchCarDetails();
  };

  const handleFavoritePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    toggleFavorite({ make, model });
  };

  const handleComparePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    if (isCompared) {
      removeFromCompare(activeCompareCar);
      return;
    }
    addToCompare(activeCompareCar);
  };

  React.useEffect(() => {
    let mounted = true;
    async function loadImage() {
      setLoading(true);
      const wikiImage = await fetchWikipediaCarImage(make, model);
      if (!mounted) return;
      if (wikiImage) {
        setImageUri(wikiImage);
        setSourceStep("wiki");
        setLoading(false);
        return;
      }

      const carImagesUrl = await getCarImagesFallbackUrl({
        make,
        model,
        year,
      });
      if (!mounted) return;
      if (carImagesUrl) {
        setImageUri(carImagesUrl);
        setSourceStep("carimages");
      } else {
        setImageUri(null);
        setSourceStep("fallback");
      }
      setLoading(false);
    }
    loadImage();
    return () => {
      mounted = false;
    };
  }, [make, model, year]);

  const handleImageError = () => {
    if (sourceStep === "wiki") {
      getCarImagesFallbackUrl({ make, model, year }).then((url) => {
        setImageUri(url);
        setSourceStep(url ? "carimages" : "fallback");
      });
      return;
    }
    setImageUri(null);
    setSourceStep("fallback");
  };

  const renderImageContent = () =>
    imageUri && sourceStep !== "fallback" ? (
      <Image
        source={{ uri: imageUri }}
        style={styles.imageCard}
        onError={handleImageError}
      />
    ) : (
      <View style={[styles.imageCard, styles.imageFallback]}>
        <Text style={styles.imageFallbackInitials}>
          {make.slice(0, 2).toUpperCase()}
        </Text>
        <Text style={styles.imageFallbackModel} numberOfLines={1}>
          {model}
        </Text>
      </View>
    );

  return (
    <TouchableOpacity testID="car-card-pressable" onPress={handleCardPress}>
      <View style={styles.card}>
        {loading ? <LoadingIndicator /> : renderImageContent()}
        {showCompare && (
          <TouchableOpacity
            testID="car-compare-pressable"
            accessibilityRole="button"
            style={[
              styles.compareCardIconButton,
              isCompared && styles.compareCardIconButtonSelected,
            ]}
            onPress={handleComparePress}
          >
            <FontAwesome
              name={isCompared ? "check" : "bar-chart"}
              size={16}
              color={isCompared ? "#fff" : Colors[theme].accent}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          testID="car-favorite-pressable"
          style={styles.favoriteIcon}
          onPress={handleFavoritePress}
        >
          <FontAwesome
            name={isFavorite ? "heart" : "heart-o"}
            size={21}
            color={isFavorite ? Colors[theme].not : Colors[theme].text}
          />
        </TouchableOpacity>
        <Text style={styles.subtitle}>
          {make} {model}
        </Text>
      </View>
      <Modal
        testID="car-details-modal"
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.modalScrollContent}
            >
              {renderImageContent()}
              <Text style={styles.subtitle}>
                {make} {model}
              </Text>
              {detailsStatus === "loading" ? (
                <LoadingIndicator />
              ) : (
                <Text style={styles.description}>
                  {carDetails || t("noDetails")}
                </Text>
              )}
            </ScrollView>
            <CustomButton
              title={t("close")}
              onPress={handleCloseModal}
              variant="danger"
            />
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

export default CarCard;
