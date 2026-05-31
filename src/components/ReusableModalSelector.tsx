import React from "react";
import { View, StyleSheet } from "react-native";
import ModalSelector from "react-native-modal-selector";

import { Colors } from "@/constants/Colors";

import { useTheme } from "../context/ThemeContext";

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
  const { theme } = useTheme();
  const localStyles = customStyles(theme);

  const selectedLabel =
    data.find((item) => item.value === selectedValue)?.label ?? label;

  return (
    <View style={localStyles.container}>
      <ModalSelector
        data={data}
        initValue={selectedLabel}
        onChange={(option) => onValueChange(option.value)}
        style={localStyles.selector}
        initValueTextStyle={localStyles.valueText}
        selectTextStyle={localStyles.valueText}
        optionTextStyle={localStyles.valueText}
        optionContainerStyle={localStyles.optionContainer}
        cancelTextStyle={localStyles.cancelText}
        cancelText="Cancel"
      />
    </View>
  );
};

const customStyles = (theme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      width: "48%",
    },
    selector: {
      width: "100%",
    },
    valueText: {
      color: Colors[theme].text,
      fontWeight: "600",
      textAlign: "center",
      paddingVertical: 5,
      fontFamily: "PoetsenOne",
    },
    optionContainer: {
      backgroundColor: Colors[theme].card,
    },
    cancelText: {
      color: Colors[theme].not,
      fontWeight: "600",
      textAlign: "center",
      fontFamily: "PoetsenOne",
    },
  });

export default ReusableModalSelector;
