import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

import { useTheme } from "../context/ThemeContext";
import { createGlobalStyles } from "@/constants/GlobalStyles";

interface ReusableModalSelectorProps {
  label: string;
  data: { key: string; label: string; value: string }[];
  selectedValue: string | null;
  onValueChange: (value: string) => void;
}

const ReusableModalSelector: React.FC<ReusableModalSelectorProps> = ({
  label,
  data,
  selectedValue,
  onValueChange,
}) => {
  const [visible, setVisible] = React.useState(false);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);
  const { height } = useWindowDimensions();
  const modalMaxHeight = Math.min(height - 96, 420);

  const selectedLabel =
    data.find((item) => item.value === selectedValue)?.label ?? label;

  return (
    <View style={{ width: "48%" }}>
      <TouchableOpacity
        accessibilityRole="button"
        style={styles.pickerTrigger}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.pickerTriggerText} numberOfLines={1}>
          {selectedLabel}
        </Text>
      </TouchableOpacity>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable
            accessible={false}
            accessibilityRole="button"
            style={styles.modalBackdropPressable}
            onPress={() => setVisible(false)}
          />
          <View
            style={[styles.pickerModalContent, { maxHeight: modalMaxHeight }]}
          >
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>{label}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => setVisible(false)}
              >
                <Text style={styles.pickerModalCloseText}>
                  {t("close", "Close")}
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.pickerOptionsScroll}
              contentContainerStyle={styles.pickerOptionsContent}
            >
              {data.map((item) => {
                const isSelected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    key={item.key}
                    accessibilityRole="button"
                    style={[
                      styles.pickerOption,
                      isSelected && styles.pickerOptionSelected,
                    ]}
                    onPress={() => {
                      onValueChange(item.value);
                      setVisible(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ReusableModalSelector;
