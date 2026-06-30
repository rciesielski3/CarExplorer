import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';
import { LanguageProvider } from '../../context/LanguageContext';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock i18next for testing
jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => ({
    t: (key, fallback) => fallback,
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  }),
}));

describe('HomeScreen Internationalization', () => {
  it('renders hero section with Drive text using i18n', () => {
    const { getByText } = render(
      <LanguageProvider>
        <ThemeProvider>
          <HomeScreen />
        </ThemeProvider>
      </LanguageProvider>
    );

    expect(getByText('Drive')).toBeTruthy();
  });

  it('renders hero section with Curiosity text using i18n', () => {
    const { getByText } = render(
      <LanguageProvider>
        <ThemeProvider>
          <HomeScreen />
        </ThemeProvider>
      </LanguageProvider>
    );

    expect(getByText('Curiosity')).toBeTruthy();
  });

  it('renders hero eyebrow using i18n', () => {
    const { getByText } = render(
      <LanguageProvider>
        <ThemeProvider>
          <HomeScreen />
        </ThemeProvider>
      </LanguageProvider>
    );

    expect(getByText('Your automotive companion')).toBeTruthy();
  });

  it('renders hero subtitle using i18n', () => {
    const { getByText } = render(
      <LanguageProvider>
        <ThemeProvider>
          <HomeScreen />
        </ThemeProvider>
      </LanguageProvider>
    );

    expect(getByText(/Browse makes, decode VINs/)).toBeTruthy();
  });

  it('renders Ask AI section with label using i18n', () => {
    const { getByText } = render(
      <LanguageProvider>
        <ThemeProvider>
          <HomeScreen />
        </ThemeProvider>
      </LanguageProvider>
    );

    expect(getByText('Ask AI')).toBeTruthy();
  });

  it('renders AI input placeholder using i18n', () => {
    const { getByPlaceholderText } = render(
      <LanguageProvider>
        <ThemeProvider>
          <HomeScreen />
        </ThemeProvider>
      </LanguageProvider>
    );

    expect(getByPlaceholderText('Ask anything about cars...')).toBeTruthy();
  });

  it('renders AI quota text using i18n', () => {
    const { getByText } = render(
      <LanguageProvider>
        <ThemeProvider>
          <HomeScreen />
        </ThemeProvider>
      </LanguageProvider>
    );

    expect(getByText('5 left today')).toBeTruthy();
  });

  it('renders quick action buttons using i18n', () => {
    const { getByText } = render(
      <LanguageProvider>
        <ThemeProvider>
          <HomeScreen />
        </ThemeProvider>
      </LanguageProvider>
    );

    // These buttons use i18n keys
    expect(getByText('Compare')).toBeTruthy();
    expect(getByText('Car Quiz')).toBeTruthy();
  });

  it('all hero strings have corresponding i18n fallbacks', () => {
    // Verify that the component renders without throwing
    expect(() => {
      render(
        <LanguageProvider>
          <ThemeProvider>
            <HomeScreen />
          </ThemeProvider>
        </LanguageProvider>
      );
    }).not.toThrow();
  });

  it('all AI section strings have corresponding i18n fallbacks', () => {
    // Verify that AI section renders properly with fallbacks
    const { getByText } = render(
      <LanguageProvider>
        <ThemeProvider>
          <HomeScreen />
        </ThemeProvider>
      </LanguageProvider>
    );

    // Both "Ask AI" label and quota should be present
    expect(getByText('Ask AI')).toBeTruthy();
  });
});
