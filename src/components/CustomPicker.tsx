import React from "react";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";

import { createGlobalStyles } from "@/constants/GlobalStyles";

import { useTheme } from "../context/ThemeContext";

interface PickerProps {
  selectedValue: string | null;
  onValueChange: (value: string) => void;
  label: string;
  options: { key: string; label: string }[];
}

const CustomPicker: React.FC<PickerProps> = ({
  selectedValue,
  onValueChange,
  label,
  options,
}) => {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);

  return (
    <View>
      <Text style={styles.buttonText}>{label}</Text>
      <Picker
        selectedValue={selectedValue ?? ""}
        onValueChange={onValueChange}
        style={styles.picker}
      >
        <Picker.Item label="Select an option" value="" />
        {options.map((option) => (
          <Picker.Item
            key={option.key}
            label={option.label}
            value={option.key}
          />
        ))}
      </Picker>
    </View>
  );
};

export default CustomPicker;
