import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '../context/ThemeContext';
import { createGlobalStyles } from '@/constants/GlobalStyles';

interface SpecRangeProps {
  values: string[];
  fallback?: string;
}

export const SpecRange: React.FC<SpecRangeProps> = ({
  values,
  fallback = 'N/A',
}) => {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);
  const [expanded, setExpanded] = useState(false);

  if (!values || values.length === 0) {
    return <Text style={styles.compareValueText}>{fallback}</Text>;
  }

  // 1-2 values: show all
  if (values.length <= 2) {
    return <Text style={styles.compareValueText}>{values.join(', ')}</Text>;
  }

  // 3+ values: show range with expand button
  const min = values[0];
  const max = values[values.length - 1];

  if (!expanded) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={styles.compareValueText}>
          {min} - {max}
        </Text>
        <TouchableOpacity
          onPress={() => setExpanded(true)}
          accessibilityRole="button"
          accessibilityLabel="Expand values"
        >
          <Ionicons
            name="chevron-down"
            size={16}
            color={Colors[theme].text}
          />
        </TouchableOpacity>
      </View>
    );
  }

  // Expanded: show all values
  return (
    <View>
      {values.map((value, index) => (
        <View
          key={`${value}-${index}`}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <Text style={styles.compareValueText}>{value}</Text>
          {index === values.length - 1 && (
            <TouchableOpacity
              onPress={() => setExpanded(false)}
              accessibilityRole="button"
              accessibilityLabel="Collapse values"
            >
              <Ionicons
                name="chevron-up"
                size={16}
                color={Colors[theme].text}
              />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};
