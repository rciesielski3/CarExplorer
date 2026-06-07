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
  const [carDetails, setCarDetails] = React.useState<string | null>(null);
  const [loadingDetails, setLoadingDetails] = React.useState<boolean>(false);

  const { t } = useTranslation();

  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);
  const stylesHome = createHomeScreenStyles(theme);

  const { language } = useAppLanguage();
  const activeLanguage = language || "en";
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.some(
    (car) => car.make === make && car.model === model
  );

  const fetchCarDetails = async () => {
    setLoadingDetails(true);
    try {
      const details = await getCarDetails(make, model, activeLanguage);
      setCarDetails(details);
    } catch (error) {
      console.error("Error fetching car details:", error);
      setCarDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setCarDetails(null);
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

  React.useEffect(() => {
    const fetchImage = async () => {
      setLoading(true);
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

  return (
    <TouchableOpacity testID="car-card-pressable" onPress={handleCardPress}>
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
          testID="car-favorite-pressable"
          style={styles.favoriteIcon}
          onPress={handleFavoritePress}
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
      <Modal
        testID="car-details-modal"
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
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
                  {carDetails || t("noDetails")}
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
