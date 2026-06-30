import React, { ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Settings = {
  preferredUnitSystem: 'metric' | 'imperial';
};

interface SettingsContextProps {
  settings: Settings;
  setPreferredUnitSystem: (system: 'metric' | 'imperial') => Promise<void>;
  isHydrated: boolean;
}

const SettingsContext = React.createContext<SettingsContextProps | undefined>(
  undefined
);

const defaultSettings: Settings = {
  preferredUnitSystem: 'metric',
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [settings, setSettingsState] = React.useState<Settings>(defaultSettings);
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    const hydrateSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem("carexplorer_settings");
        if (stored !== null) {
          const parsedSettings = JSON.parse(stored);
          setSettingsState(parsedSettings);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsHydrated(true);
      }
    };

    hydrateSettings();
  }, []);

  const setPreferredUnitSystem = async (system: 'metric' | 'imperial') => {
    try {
      const updatedSettings = { ...settings, preferredUnitSystem: system };
      await AsyncStorage.setItem("carexplorer_settings", JSON.stringify(updatedSettings));
      setSettingsState(updatedSettings);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, setPreferredUnitSystem, isHydrated }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = React.useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
