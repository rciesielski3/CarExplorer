import { StyleSheet } from 'react-native';
import { Colors } from './Colors';

export const createGlobalStyles = (theme: 'light' | 'dark') =>
  StyleSheet.create({
    text: {
      color: Colors[theme].text,
      fontSize: 14,
      fontWeight: '500',
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    animation: {
      width: 200,
      height: 200,
    },
    unitButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: Colors[theme].background,
      borderWidth: 1,
      borderColor: Colors[theme].border,
    },
    unitButtonActive: {
      backgroundColor: Colors[theme].accent,
      borderColor: Colors[theme].accent,
    },
    unitButtonText: {
      color: Colors[theme].text,
      fontSize: 14,
      fontWeight: '600',
    },
  });
