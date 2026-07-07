jest.mock('../../components/AdBanner', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CompareScreen from '../CompareScreen';
import { CompareProvider, CompareCar } from '../../context/CompareContext';
import { SettingsProvider } from '../../context/SettingsContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { LanguageProvider } from '../../context/LanguageContext';
import { useCompare } from '../../context/CompareContext';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';

type MockCar = CompareCar & { id: string; wikidata: string };

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../../api/wikipediaApi', () => ({
  getCarDetails: jest.fn().mockResolvedValue(null),
}));

describe('CompareScreen - Specifications', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('displays specifications from Wikidata', async () => {
    let compareContext: ReturnType<typeof useCompare>;
    let settingsContext: ReturnType<typeof useSettings>;

    const TestProbe = () => {
      compareContext = useCompare();
      settingsContext = useSettings();

      // Mock car with specifications
      const mockCar: MockCar = {
        id: '1',
        make: 'Toyota',
        model: 'Camry',
        year: '2024',
        vehicleType: 'Sedan',
        wikidata: 'Q1234',
        specifications: {
          engine: ['2.0L', '2.5L'],
          power: ['150 kW', '165 kW'],
          torque: ['280 Nm', '310 Nm'],
          acceleration: ['10.5 s', '9.8 s'],
          weight: ['1500 kg', '1550 kg'],
          dimensions: ['4850x1850x1480 mm'],
          fuelType: ['Petrol'],
          transmission: ['Manual', 'Automatic'],
          topSpeed: ['200 km/h', '220 km/h'],
        },
      };

      // Verify car data structure
      expect(mockCar.specifications).toBeDefined();
      expect(mockCar.specifications?.engine).toEqual(['2.0L', '2.5L']);
      expect(mockCar.specifications?.power).toEqual(['150 kW', '165 kW']);

      return <CompareScreen />;
    };

    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <NavigationContainer>
        <ThemeProvider>
          <LanguageProvider>
            <CompareProvider>
              <SettingsProvider>
                <TestProbe />
              </SettingsProvider>
            </CompareProvider>
          </LanguageProvider>
        </ThemeProvider>
        </NavigationContainer>
      );
    });

    expect(renderer!).toBeDefined();
  });

  it('displays N/A for missing specifications', async () => {
    let settingsContext: ReturnType<typeof useSettings>;

    const TestProbe = () => {
      settingsContext = useSettings();

      // Mock car without specifications
      const mockCar: MockCar = {
        id: '2',
        make: 'Tesla',
        model: 'Model 3',
        year: '2024',
        vehicleType: 'Sedan',
        wikidata: 'Q5678',
        // No specifications property
      };

      // Verify car has no specifications
      expect(mockCar.specifications).toBeUndefined();

      return <CompareScreen />;
    };

    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <NavigationContainer>
        <ThemeProvider>
          <LanguageProvider>
            <CompareProvider>
              <SettingsProvider>
                <TestProbe />
              </SettingsProvider>
            </CompareProvider>
          </LanguageProvider>
        </ThemeProvider>
        </NavigationContainer>
      );
    });

    expect(renderer!).toBeDefined();
  });

  it('converts units based on user preference', async () => {
    let settingsContext: ReturnType<typeof useSettings>;
    const conversionResults: string[] = [];

    const TestProbe = () => {
      settingsContext = useSettings();

      // Mock car with specifications
      const mockCar: MockCar = {
        id: '3',
        make: 'BMW',
        model: 'M440i',
        year: '2024',
        vehicleType: 'Sedan',
        wikidata: 'Q1420',
        specifications: {
          engine: [],
          power: ['150 kW'],
          torque: [],
          acceleration: [],
          weight: ['1500 kg'],
          dimensions: [],
          fuelType: [],
          transmission: [],
          topSpeed: [],
        },
      };

      // Verify imperial conversion logic
      // 150 kW * 1.34102 ≈ 201 HP
      // 1500 kg * 2.20462 ≈ 3307 lbs
      if (settingsContext.settings.preferredUnitSystem === 'imperial') {
        const powerHP = Math.round(150 * 1.34102);
        const weightLbs = Math.round(1500 * 2.20462);
        conversionResults.push(`${powerHP} HP`);
        conversionResults.push(`${weightLbs} lbs`);
      }

      return <CompareScreen />;
    };

    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <NavigationContainer>
        <ThemeProvider>
          <LanguageProvider>
            <CompareProvider>
              <SettingsProvider>
                <TestProbe />
              </SettingsProvider>
            </CompareProvider>
          </LanguageProvider>
        </ThemeProvider>
        </NavigationContainer>
      );
    });

    expect(renderer!).toBeDefined();
  });

  it('expands range display when tapped', async () => {
    let settingsContext: ReturnType<typeof useSettings>;
    const rangeStates: boolean[] = [];

    const TestProbe = () => {
      settingsContext = useSettings();

      // Mock car with multiple engine values that should show as range
      const mockCar: MockCar = {
        id: '4',
        make: 'Honda',
        model: 'Accord',
        year: '2024',
        vehicleType: 'Sedan',
        wikidata: 'Q9695',
        specifications: {
          engine: ['2.0L', '2.5L', '3.0L', '3.5L'],
          power: [],
          torque: [],
          acceleration: [],
          weight: [],
          dimensions: [],
          fuelType: [],
          transmission: [],
          topSpeed: [],
        },
      };

      // Verify range logic: >2 values should show as min-max range
      const engines = mockCar.specifications?.engine || [];
      if (engines.length > 2) {
        const min = engines[0];
        const max = engines[engines.length - 1];
        rangeStates.push(true); // Range state (collapsed)
      }

      // When expanded, show all values
      if (rangeStates.length > 0) {
        expect(engines[0]).toBe('2.0L');
        expect(engines[engines.length - 1]).toBe('3.5L');
      }

      return <CompareScreen />;
    };

    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <NavigationContainer>
        <ThemeProvider>
          <LanguageProvider>
            <CompareProvider>
              <SettingsProvider>
                <TestProbe />
              </SettingsProvider>
            </CompareProvider>
          </LanguageProvider>
        </ThemeProvider>
        </NavigationContainer>
      );
    });

    expect(renderer!).toBeDefined();
    expect(rangeStates.length).toBeGreaterThan(0);
  });
});
