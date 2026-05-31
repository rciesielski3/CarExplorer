import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18next from "i18next";

interface LanguageContextProps {
  language: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<string>(i18next.language);

  useEffect(() => {
    const loadLanguage = async () => {
      const storedLang = await AsyncStorage.getItem("appLanguage");
      if (storedLang) {
        i18next.changeLanguage(storedLang);
        setLanguage(storedLang);
      }
    };
    loadLanguage();
  }, []);

  const updateLanguage = async (lang: string) => {
    await AsyncStorage.setItem("appLanguage", lang);
    i18next.changeLanguage(lang);
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: updateLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook
export const useAppLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useAppLanguage must be used within a LanguageProvider");
  return context;
};
