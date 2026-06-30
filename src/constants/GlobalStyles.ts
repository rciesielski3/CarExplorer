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
  });
