import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";

import { FontAwesome } from "@expo/vector-icons";
import {
  createGlobalStyles,
  createHomeScreenStyles,
} from "@/constants/GlobalStyles";
import { Colors } from "@/constants/Colors";

import { getCarImageUrl, getCarDetails } from "../api/wikipediaApi";
import { useAppLanguage } from "../context/LanguageContext";
import { useFavorites } from "../context/FavoritesContext";
import { useTheme } from "../context/ThemeContext";
import { IMAGES } from "../constants/Assets";
import LoadingIndicator from "./LoadingIndicator";

interface CarCardProps {
  make: string;
  model: string;
}

const CarCard: React.FC<CarCardProps> = ({ make, model }) => {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [carDetails, setCarDetails] = React.useState<
    Record<string, string | null>
  >({});
  const [loadingDetails, setLoadingDetails] = React.useState<boolean>(false);

  const { t } = useTranslation();

  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);
  const stylesHome = createHomeScreenStyles(theme);

  const { language } = useAppLanguage();
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.some(
    (car) => car.make === make && car.model === model
  );

  const fetchCarDetails = async () => {
    setLoadingDetails(true);
    try {
      const details = await getCarDetails(make, model, language);
      if (details && Object.keys(details).length > 0) {
        setCarDetails(details || "No details available.");
      } else {
        setCarDetails({});
      }
    } catch (error) {
      console.error("Error fetching car details:", error);
      setCarDetails({});
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setCarDetails({});
  };

  const handleCardPress = () => {
    fetchCarDetails();
  };

  React.useEffect(() => {
    const fetchImage = async () => {
      try {
        const url = await getCarImageUrl(make, model);
        setImageUrl(url);
      } catch (error) {
        console.error("Error fetching image:", error);
        setImageUrl(null);
      } finally {
        setLoading(false);
      }
    };
    fetchImage();
  }, [make, model]);

  React.useEffect(() => {
    if (Object.keys(carDetails).length > 0) {
      setModalVisible(true);
    }
  }, [carDetails]);

  return (
    <TouchableOpacity onPress={handleCardPress}>
      <View style={styles.card}>
        {loading ? (
          <LoadingIndicator />
        ) : (
          <Image
            source={imageUrl ? { uri: imageUrl } : IMAGES.PLACEHOLDER}
            style={styles.imageCard}
          />
        )}
        <TouchableOpacity
          style={styles.favoriteIcon}
          onPress={() => toggleFavorite({ make, model })}
        >
          <FontAwesome
            name={isFavorite ? "heart" : "heart-o"}
            size={24}
            color={isFavorite ? Colors[theme].not : "black"}
          />
        </TouchableOpacity>
        <Text style={styles.subtitle}>
          {make} {model}
        </Text>
      </View>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.scrollContainer}>
              <Image
                source={imageUrl ? { uri: imageUrl } : IMAGES.PLACEHOLDER}
                style={styles.imageCard}
              />
              <Text style={styles.subtitle}>
                {make} {model}
              </Text>
              {loadingDetails ? (
                <LoadingIndicator />
              ) : (
                <Text style={styles.description}>
                  {typeof carDetails === "string"
                    ? carDetails
                    : Object.values(carDetails).join(" ") || t("noDetails")}
                </Text>
              )}
            </ScrollView>
            <TouchableOpacity
              style={[
                stylesHome.button,
                { backgroundColor: Colors[theme].not },
              ]}
              onPress={handleCloseModal}
            >
              <Text style={styles.buttonText}>{t("close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

export default CarCard;
