import React from "react";
import { Modal, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { createGlobalStyles } from "@/constants/GlobalStyles";
import { Colors } from "@/constants/Colors";

import { APP_CONFIG } from "../config/apiConfig";
import { useTheme } from "../context/ThemeContext";
import CustomButton from "./CustomButton";

interface AboutModalProps {
  visible: boolean;
  title: string;
  description: string;
  developerLabel: string;
  closeLabel: string;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({
  visible,
  title,
  description,
  developerLabel,
  closeLabel,
  onClose,
}) => {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.aboutModalContent}>
          <View style={styles.aboutModalIcon}>
            <Ionicons
              name="information-circle-outline"
              size={28}
              color={Colors[theme].accent}
            />
          </View>
          <Text style={styles.confirmModalTitle}>{title}</Text>
          <Text style={styles.aboutModalDescription}>{description}</Text>
          <View style={styles.aboutModalMeta}>
            <Text style={styles.aboutModalLabel}>
              {developerLabel}: {APP_CONFIG.DEVELOPER}
            </Text>
            <Text style={styles.aboutModalLabel}>
              {APP_CONFIG.VERSION}
            </Text>
            <Text style={styles.aboutModalCopyright}>
              {APP_CONFIG.COPYRIGHT}
            </Text>
          </View>
          <CustomButton title={closeLabel} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

export default AboutModal;
