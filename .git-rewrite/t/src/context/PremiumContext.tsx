import React, { ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PremiumContextProps {
  isPremium: boolean;
  setIsPremium: (value: boolean) => void;
  isHydrated: boolean;
}

const PremiumContext = React.createContext<PremiumContextProps | undefined>(
  undefined
);

export const PremiumProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isPremium, setPremiumState] = React.useState(false);
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    const hydratePremium = async () => {
      try {
        const stored = await AsyncStorage.getItem("isPremium");
        if (stored !== null) {
          setPremiumState(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to load premium status:", error);
      } finally {
        setIsHydrated(true);
      }
    };

    hydratePremium();
  }, []);

  const setIsPremium = async (value: boolean) => {
    try {
      await AsyncStorage.setItem("isPremium", JSON.stringify(value));
      setPremiumState(value);
    } catch (error) {
      console.error("Failed to save premium status:", error);
    }
  };

  return (
    <PremiumContext.Provider value={{ isPremium, setIsPremium, isHydrated }}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = React.useContext(PremiumContext);
  if (!context) {
    throw new Error("usePremium must be used within a PremiumProvider");
  }
  return context;
};
